type TravelResult = {
  id: string;
  title: string;
  description: string;
  recommendedPlaces: string[];
  slogan: string;
  characterName: string;
};

export const travelResults: TravelResult[] = [
  {
    id: "healer",
    title: "고요한 힐링러",
    description:
      "도시의 소음보다 바람 소리가 더 좋은 당신. 조용한 공간에서 자신과 마주하는 여행을 사랑해요. 느릿한 골목, 따뜻한 찻잔, 나만의 속도로 걷는 것이 최고의 힐링이죠.",
    recommendedPlaces: ["교토", "속초", "몽생미셸"],
    slogan: "조용히, 하지만 깊게. 나를 위한 여행",
    characterName: "무무",
  },
  {
    id: "explorer",
    title: "계획형 탐험가",
    description:
      "일정표, 지도, 루트까지 꼼꼼히 준비하는 당신은 완벽한 여정을 추구하는 탐험가예요. 시간 낭비 없는 알찬 하루가 곧 최고의 여행이죠!",
    recommendedPlaces: ["도쿄", "바르셀로나", "뉴욕"],
    slogan: "계획은 완벽하게, 여정은 자유롭게!",
    characterName: "다니",
  },
  {
    id: "foodie",
    title: "미식가 여행자",
    description:
      "여행의 중심은 언제나 음식! 현지 시장, 로컬 맛집, 야시장까지… 당신은 “뭘 먹을까?”가 하루의 중심인 진정한 미식가예요.",
    recommendedPlaces: ["오사카", "타이베이", "부산"],
    slogan: "맛있는 게 남는 거야!",
    characterName: "찌꾸",
  },
  {
    id: "romantic",
    title: "감성 바다러",
    description:
      "일몰, 파도, 따뜻한 바람… 당신은 풍경 속 감정을 느끼는 로맨티스트예요. 차분한 시선으로 여행의 순간을 마음에 새겨요.",
    recommendedPlaces: ["산토리니", "세비야", "여수"],
    slogan: "조용한 파도와 노을, 그게 나의 언어",
    characterName: "마린",
  },
  {
    id: "free",
    title: "즉흥형 모험가",
    description:
      "즉흥적인 결정, 예상치 못한 길, 우연히 만난 풍경… 당신은 계획보다 흘러가는 대로 떠나는 자유로운 여행자예요.",
    recommendedPlaces: ["라오스", "후쿠오카", "제주"],
    slogan: "떠나고 싶은 대로 떠나는 나만의 순간",
    characterName: "뿡이",
  },
  {
    id: "record",
    title: "기록형 여행자",
    description:
      "감성적인 풍경, 카페, 골목… 당신은 순간의 감정을 사진과 글로 남기며 여행을 두 번 즐기는 기록가예요.",
    recommendedPlaces: ["파리", "프라하", "전주"],
    slogan: "사진과 글로 남기는 나의 여정",
    characterName: "도도",
  },
  {
    id: "adventure",
    title: "액티비티 마니아",
    description:
      "여행은 곧 짜릿함! 패러글라이딩, 스쿠버, 놀이공원… 당신은 온몸으로 여행을 느끼는 액티비티 마니아예요.",
    recommendedPlaces: ["퀸즈타운", "다낭", "홍천"],
    slogan: "심장이 두근거리면 그게 여행이지!",
    characterName: "탱탱이",
  },
  {
    id: "nature",
    title: "숲속 힐링러",
    description:
      "별과 나무, 불멍과 모닥불. 당신은 도시를 벗어난 조용한 자연 속에서 충전하는 진짜 힐링러예요.",
    recommendedPlaces: ["알프스", "속리산", "토야마"],
    slogan: "자연이 곧 나의 안식처",
    characterName: "숲이",
  },
  {
    id: "urban",
    title: "도시 감성러",
    description:
      "거리의 소음, 카페 골목, 밤의 네온사인까지. 당신은 도시의 결을 감성적으로 받아들이는 스타일이에요.",
    recommendedPlaces: ["서울", "홍콩", "시카고"],
    slogan: "도시의 리듬을 따라 걷는 나만의 방식",
    characterName: "미오",
  },
  {
    id: "artist",
    title: "감성 예술러",
    description:
      "갤러리 산책, 소극장, 독립 서점… 당신은 예술과 창작을 여행의 한 장면처럼 사랑하는 감성적인 예술러예요.",
    recommendedPlaces: ["베를린", "교토", "파리"],
    slogan: "예술이 흐르는 골목에서 영감을 만나요",
    characterName: "루루",
  },
];
