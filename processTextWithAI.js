export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // an toàn hơn
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // có thể đổi thành gpt-3.5-turbo nếu muốn tiết kiệm
        messages: [
          {
            role: "system",
            content:
              "Bạn là trợ lý chuyên tạo sơ đồ tư duy. Hãy phân tích văn bản và trả về cấu trúc sơ đồ tư duy dưới dạng JSON với topic và các branches có level và type.",
          },
          {
            role: "user",
            content: `Hãy tạo sơ đồ tư duy từ văn bản sau: ${text}`,
          },
        ],
      }),
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi gọi OpenAI:", error);
    res.status(500).json({ error: "Có lỗi xảy ra khi xử lý văn bản." });
  }
}
