type NotificationPayload = {
  notify_at?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as NotificationPayload;

    if (!payload.notify_at || Number.isNaN(Date.parse(payload.notify_at))) {
      return Response.json(
        { message: "Некорректная дата встречи" },
        { status: 400 },
      );
    }

    const backendUrl = (process.env.BACKEND_URL ?? "http://127.0.0.1:1112")
      .replace(/\/$/, "");
    const response = await fetch(`${backendUrl}/send_notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notify_at: payload.notify_at }),
    });
    const result = await response.json();

    return Response.json(result, { status: response.status });
  } catch (error) {
    console.error("Notification API error:", error);

    return Response.json(
      { message: "Сервис уведомлений временно недоступен" },
      { status: 502 },
    );
  }
}
