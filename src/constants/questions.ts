export type Question = {
  id: number;
  text: string;
  options: {
    label: string;
    value: string;
  }[];
};

export const questions: Question[] = [
  {
    id: 1,
    text: "여행을 계획할 때 나는...",
    options: [
      { label: "계획표, 루트, 맛집까지 꼼꼼하게 정리!", value: "explorer" },
      { label: "일정은 느슨하게, 현지 분위기 따라 유연하게", value: "healer" },
      { label: "어디든 좋아! 일단 떠나보는 거지", value: "free" },
      { label: "SNS 핫플 중심으로 코스 조정", value: "record" },
    ],
  },
  {
    id: 2,
    text: "이상적인 여행지는?",
    options: [
      { label: "고요한 자연 속 힐링 장소", value: "nature" },
      { label: "예쁜 전시관과 감성 골목", value: "artist" },
      { label: "밤거리와 카페가 매력적인 도심", value: "urban" },
      { label: "볼거리 많은 랜드마크 중심 도시", value: "explorer" },
    ],
  },
  {
    id: 3,
    text: "여행 중 하루를 보내는 나의 방식은?",
    options: [
      { label: "카페에 앉아 노트 쓰며 쉬기", value: "record" },
      { label: "갤러리나 서점에서 감상하며 보내기", value: "artist" },
      { label: "시티투어로 부지런하게 돌아다니기", value: "explorer" },
      { label: "즉흥으로 오늘의 루트 결정!", value: "free" },
    ],
  },
  {
    id: 4,
    text: "여행 중 가장 설레는 순간은?",
    options: [
      { label: "별빛 아래에서 불멍 피울 때", value: "nature" },
      { label: "낯선 음식과 향에 빠질 때", value: "foodie" },
      { label: "놀이기구, 바다스포츠 등 스릴 만점!", value: "adventure" },
      { label: "노을이 지는 해변 산책", value: "romantic" },
    ],
  },
  {
    id: 5,
    text: "여행에서 가장 중요하게 생각하는 것은?",
    options: [
      { label: "새로운 경험과 체험", value: "adventure" },
      { label: "감성적인 기록과 공유", value: "record" },
      { label: "도심의 트렌디한 공간", value: "urban" },
      { label: "전시, 공연 등 문화 콘텐츠", value: "artist" },
    ],
  },
  {
    id: 6,
    text: "여행 중 가장 듣기 좋은 말은?",
    options: [
      { label: "와 이 맛집 대박이다!", value: "foodie" },
      { label: "여긴 너랑 진짜 잘 어울린다", value: "romantic" },
      { label: "오늘 하루 완전 알찼다!", value: "explorer" },
      { label: "사진 감성 미쳤다!", value: "record" },
    ],
  },
  {
    id: 7,
    text: "갑자기 비가 내린다면 나는?",
    options: [
      { label: "근처 전시관이나 책방으로 피신!", value: "artist" },
      { label: "비 오는 숲 산책도 운치 있지", value: "nature" },
      { label: "플랜 B로 완벽하게 대체", value: "explorer" },
      { label: "비 오는 도시 감성 사진 찍기", value: "urban" },
    ],
  },
  {
    id: 8,
    text: "여행 파트너가 갑자기 변덕을 부리면?",
    options: [
      { label: "나도 그럴 때가 있어서 이해함", value: "free" },
      { label: "계획 무너져도 그게 또 여행이지", value: "healer" },
      { label: "새로운 계획을 세워보자", value: "explorer" },
      { label: "혼자서도 잘 즐길 수 있음", value: "romantic" },
    ],
  },
  {
    id: 9,
    text: "카메라를 꺼내고 싶은 순간은?",
    options: [
      { label: "나무와 하늘이 맞닿은 풍경", value: "nature" },
      { label: "로컬 음식이 잘 담긴 한 컷", value: "foodie" },
      { label: "갤러리 속 아트워크 앞", value: "artist" },
      { label: "반짝이는 도시의 야경", value: "urban" },
    ],
  },
  {
    id: 10,
    text: "여행을 마친 후 나는...",
    options: [
      { label: "다음 루트를 벌써 그리고 있어요", value: "explorer" },
      { label: "잊지 않도록 글과 사진을 남겨요", value: "record" },
      { label: "또 떠나고 싶다…", value: "healer" },
      { label: "혼자만의 추억으로 간직해요", value: "romantic" },
    ],
  },
];
