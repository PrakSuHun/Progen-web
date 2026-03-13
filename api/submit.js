export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '허용되지 않은 메서드입니다.' });
  }

  // 💡 프론트엔드에서 변경된 폼 데이터 구조에 맞춰 환불 계좌(refundAccount)를 제거했습니다.
  const { name, age, phone, gender, school, major, grade, history, path, agree } = req.body;

  const notionApiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !databaseId) {
    return res.status(500).json({ message: '서버 설정 오류: 노션 API 키 또는 데이터베이스 ID가 없습니다.' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          "이름": { title: [ { text: { content: name } } ] },
          "만 나이": { number: age },
          "연락처": { rich_text: [ { text: { content: phone } } ] },
          "성별": { select: { name: gender } },
          "학교명": { select: { name: school } },
          "전공": { rich_text: [ { text: { content: major } } ] },
          "학년": { select: { name: grade } },
          "이력": { rich_text: [ { text: { content: history || "없음" } } ] },
          "신청 경로": { select: { name: path } },
          "개인정보 동의": { checkbox: agree }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion API Error:', data);
      return res.status(response.status).json({ message: '노션 저장 중 오류 발생', details: data });
    }

    return res.status(200).json({ message: '성공적으로 신청되었습니다.' });
    
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ message: '내부 서버 오류' });
  }
}
