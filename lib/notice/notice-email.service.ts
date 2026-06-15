/**
 * Notice email service
 * 作用：发送 owner 管理链接邮件，并在未配置真实服务时提供可观测的降级路径。
 * 联动：notice.service.ts、NoticeEmailLog、环境变量配置。
 * 层级：service
 */
type SendManageLinkEmailInput = {
  email: string;
  shortId: string;
  manageUrl: string;
  publicShareUrl: string;
};

type EmailDeliveryResult = {
  status: "SENT" | "FAILED";
  providerId?: string;
};

function buildEmailHtml(input: SendManageLinkEmailInput) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1d1a17; line-height: 1.6;">
      <h2>findMypet 管理链接</h2>
      <p>你的寻宠启事已创建成功，短码为 <strong>${input.shortId}</strong>。</p>
      <p><a href="${input.manageUrl}">打开管理页</a></p>
      <p><a href="${input.publicShareUrl}">查看公开分享页</a></p>
      <p>请妥善保存管理链接。未核实前，请勿提前支付任何费用。</p>
    </div>
  `;
}

export async function sendManageLinkEmail(input: SendManageLinkEmailInput): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn("[findMypet] email provider not configured; manage link email skipped.", {
      email: input.email,
      shortId: input.shortId
    });
    return { status: "FAILED" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [input.email],
        subject: `findMypet 管理链接 · ${input.shortId}`,
        html: buildEmailHtml(input)
      })
    });

    if (!response.ok) {
      return { status: "FAILED" };
    }

    const data = (await response.json()) as { id?: string };
    return {
      status: "SENT",
      providerId: data.id
    };
  } catch (error) {
    // 邮件只是管理链接找回辅助通道，失败不能阻断 notice 创建主链路。
    console.warn("[findMypet] manage link email failed.", {
      email: input.email,
      shortId: input.shortId,
      error
    });
    return { status: "FAILED" };
  }
}
