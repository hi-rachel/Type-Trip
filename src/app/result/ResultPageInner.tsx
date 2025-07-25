"use client";

import { useSearchParams } from "next/navigation";
import { travelResults } from "@/constants/results";
import Image from "next/image";
import { useState } from "react";
import html2canvas from "html2canvas";
import TravelChatbot from "@/components/TravelChatbot";

type TravelResult = {
  id: string;
  title: string;
  description: string;
  recommendedPlaces: string[];
  slogan: string;
  characterName: string;
};

const ResultPageInner = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const result: TravelResult | undefined = travelResults.find(
    (r) => r.id === id
  );

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-2xl">?</span>
          </div>
          <p className="text-gray-500 text-lg">결과를 불러올 수 없습니다.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300"
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    );
  }

  const { title, description, slogan, recommendedPlaces, characterName } =
    result;
  const imageUrl = `/images/${id}.png`;

  const createDownloadCard = (isBack: boolean = false): HTMLDivElement => {
    const downloadElement = document.createElement("div");
    downloadElement.style.position = "fixed";
    downloadElement.style.top = "0";
    downloadElement.style.left = "0";
    downloadElement.style.transform = "none";
    downloadElement.style.width = "450px";
    downloadElement.style.height = "660px";
    downloadElement.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    downloadElement.style.overflow = "hidden";
    downloadElement.style.zIndex = "9999";
    downloadElement.style.fontFamily =
      "'Pretendard', system-ui, -apple-system, sans-serif";

    if (isBack) {
      // 뒷면 디자인 (상세 정보)
      downloadElement.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
          <!-- 배경 이미지 -->
          <div style="position: absolute; inset: 0;">
            <img 
              src="${imageUrl}" 
              alt="${characterName} 캐릭터"
              style="width: 100%; height: 100%; object-fit: cover;"
              crossOrigin="anonymous"
            />
            <!-- 어두운 오버레이 - 더 밝게 수정 -->
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35);"></div>
            <!-- 그라데이션 오버레이 - 더 밝게 수정 -->
            <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.4) 100%);"></div>
          </div>

          <!-- 메인 콘텐츠 영역 -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; z-index: 20; padding: 24px;">
            <div style="background: rgba(255,255,255,0.3); backdrop-filter: blur(20px); border-radius: 24px; padding: 32px 24px; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
              <!-- 타이틀 -->
              <div style="text-align: center; margin-bottom: 24px;">
                <h3 style="font-size: 28px; font-weight: 800; color: #F6C851; margin: 0 0 8px 0; letter-spacing: -1px;">
                  ${title}
                </h3>
                <p style="color: #FCD34D; font-weight: 600; margin: 0; font-size: 16px;">${characterName}</p>
              </div>

              <!-- 슬로건 -->
              <div style="margin-bottom: 24px;">
                <blockquote style="color: #fff; font-weight: 700; text-align: center; font-size: 18px; font-style: italic; margin: 0; line-height: 1.4;">
                  &ldquo;${slogan}&rdquo;
                </blockquote>
              </div>

              <!-- 설명 -->
              <div style="margin-bottom: 24px;">
                <p style="color: rgba(255,255,255,0.95); font-size: 14px; line-height: 1.6; margin: 0; text-align: center; font-weight: 500;">
                  ${description}
                </p>
              </div>

              <!-- 추천 여행지 -->
              <div>
                <h4 style="font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.9); margin: 0 0 12px 0; text-align: center;   ">
                  추천 여행지
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; rgba(255,255,255,0.3);">
                  ${recommendedPlaces
                    .map(
                      (place: string) =>
                        `<span style="color: #fff; font-size: 12px;font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,0.5); display: inline-block;">✨ ${place}</span>`
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // 앞면 디자인 (이미지 중심)
      downloadElement.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
          <!-- 이미지 영역 -->
          <div style="position: relative; overflow: hidden;">
            <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%); z-index: 10;"></div>
            <img 
              src="${imageUrl}" 
              alt="${characterName} 캐릭터"
              style="width: 100%; height: 100%; object-fit: cover;"
              crossOrigin="anonymous"
            />
          </div>

          <!-- 하단 타이틀 -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; z-index: 30; margin: 0 0 25px 0;">
            <h2 style="font-size: 28px; font-weight: 800; color: #F6C851; text-align: center; letter-spacing: -1px;">
              ${title}
            </h2>
            <p style="color: #FCD34D; text-align: center; font-weight: 600; font-size: 16px;">
              ${characterName}
            </p>
          </div>
        </div>
      `;
    }

    return downloadElement;
  };

  const downloadFrontCard = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const downloadElement = createDownloadCard(false);

      // DOM에 추가
      document.body.appendChild(downloadElement);

      // 이미지 로딩 대기
      const imgElements = downloadElement.querySelectorAll("img");
      if (imgElements.length > 0) {
        await Promise.all(
          Array.from(imgElements).map((imgElement) => {
            return new Promise<void>((resolve, reject) => {
              if (imgElement.complete) {
                resolve();
              } else {
                imgElement.onload = () => resolve();
                imgElement.onerror = () =>
                  reject(new Error("이미지 로딩 실패"));
              }
            });
          })
        );
      }

      // 폰트 로딩 및 렌더링 대기
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 캡처 실행
      const canvas = await html2canvas(downloadElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        width: 450,
        height: 660,
        logging: false,
      });

      // DOM에서 제거
      document.body.removeChild(downloadElement);

      // 다운로드 실행
      const link = document.createElement("a");
      const fileName = `여행타입_${title.replace(/\s/g, "_")}_앞면.png`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png", 1.0);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("카드 앞면 다운로드 완료");
    } catch (error) {
      console.error("카드 다운로드 실패:", error);
      alert(`카드 다운로드에 실패했습니다: ${(error as Error).message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadBackCard = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const downloadElement = createDownloadCard(true);

      // DOM에 추가
      document.body.appendChild(downloadElement);

      // 이미지 로딩 대기
      const imgElements = downloadElement.querySelectorAll("img");
      if (imgElements.length > 0) {
        await Promise.all(
          Array.from(imgElements).map((imgElement) => {
            return new Promise<void>((resolve, reject) => {
              if (imgElement.complete) {
                resolve();
              } else {
                imgElement.onload = () => resolve();
                imgElement.onerror = () =>
                  reject(new Error("이미지 로딩 실패"));
              }
            });
          })
        );
      }

      // 폰트 로딩 및 렌더링 대기
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 캡처 실행
      const canvas = await html2canvas(downloadElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        width: 450,
        height: 660,
        logging: false,
      });

      // DOM에서 제거
      document.body.removeChild(downloadElement);

      // 다운로드 실행
      const link = document.createElement("a");
      const fileName = `여행타입_${title.replace(/\s/g, "_")}_뒷면.png`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png", 1.0);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("카드 뒷면 다운로드 완료");
    } catch (error) {
      console.error("카드 다운로드 실패:", error);
      alert(`카드 다운로드에 실패했습니다: ${(error as Error).message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const shareFrontCard = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const downloadElement = createDownloadCard(false);

      // DOM에 추가
      document.body.appendChild(downloadElement);

      // 이미지 로딩 대기
      const imgElements = downloadElement.querySelectorAll("img");
      if (imgElements.length > 0) {
        await Promise.all(
          Array.from(imgElements).map((imgElement) => {
            return new Promise<void>((resolve, reject) => {
              if (imgElement.complete) {
                resolve();
              } else {
                imgElement.onload = () => resolve();
                imgElement.onerror = () =>
                  reject(new Error("이미지 로딩 실패"));
              }
            });
          })
        );
      }

      // 폰트 로딩 및 렌더링 대기
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 캡처 실행
      const canvas = await html2canvas(downloadElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        width: 450,
        height: 660,
        logging: false,
      });

      // DOM에서 제거
      document.body.removeChild(downloadElement);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (!blob) throw new Error("Blob 생성 실패");

      const filesArray = [
        new File([blob], `${title}_앞면.png`, {
          type: "image/png",
        }),
      ];

      const shareData = {
        title: `나의 여행 성향은 "${title}"`,
        text: `${slogan}\n\n${description}`,
        files: filesArray,
      };

      if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        await navigator.share(shareData);
      } else {
        fallbackShare();
      }
    } catch (err) {
      console.error("공유 실패:", err);
      fallbackShare();
    } finally {
      setIsDownloading(false);
    }
  };

  const shareBackCard = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const downloadElement = createDownloadCard(true);

      // DOM에 추가
      document.body.appendChild(downloadElement);

      // 이미지 로딩 대기
      const imgElements = downloadElement.querySelectorAll("img");
      if (imgElements.length > 0) {
        await Promise.all(
          Array.from(imgElements).map((imgElement) => {
            return new Promise<void>((resolve, reject) => {
              if (imgElement.complete) {
                resolve();
              } else {
                imgElement.onload = () => resolve();
                imgElement.onerror = () =>
                  reject(new Error("이미지 로딩 실패"));
              }
            });
          })
        );
      }

      // 폰트 로딩 및 렌더링 대기
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 캡처 실행
      const canvas = await html2canvas(downloadElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        width: 450,
        height: 660,
        logging: false,
      });

      // DOM에서 제거
      document.body.removeChild(downloadElement);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (!blob) throw new Error("Blob 생성 실패");

      const filesArray = [
        new File([blob], `${title}_뒷면.png`, {
          type: "image/png",
        }),
      ];

      const shareData = {
        title: `나의 여행 성향은 "${title}"`,
        text: `${slogan}\n\n${description}`,
        files: filesArray,
      };

      if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        await navigator.share(shareData);
      } else {
        fallbackShare();
      }
    } catch (err) {
      console.error("공유 실패:", err);
      fallbackShare();
    } finally {
      setIsDownloading(false);
    }
  };

  const fallbackShare = (): void => {
    const text = `나의 여행 성향은 "${title}"\n\n${slogan}\n\n${description}\n\n${window.location.href}`;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("결과가 클립보드에 복사되었습니다!");
        })
        .catch(() => {
          alert("공유 기능이 지원되지 않는 브라우저입니다.");
        });
    } else {
      alert("공유 기능이 지원되지 않는 브라우저입니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary bg-clip-text text-transparent mb-3">
          당신의 여행 성향
        </h1>
        <p className="text-slate-600 text-lg">
          카드를 터치해서 자세히 알아보세요
        </p>
      </div>

      {/* 메인 컨테이너 */}
      <div className="max-w-md mx-auto">
        {/* 인터랙티브 카드 */}
        <div className="perspective-1000 mb-8">
          <div
            className={`relative w-full h-[500px] sm:h-[500px] md:h-[500px] transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* 앞면 - 이미지 중심 */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-2xl overflow-hidden bg-white">
              {/* 이미지 영역 */}
              <div className="relative h-[400px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
                <Image
                  src={imageUrl}
                  alt={`${characterName} 캐릭터`}
                  width={450}
                  height={660}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* 하단 타이틀 */}
              <div className="absolute bottom-4 left-0 right-0 bg-white">
                <h2 className="text-2xl font-bold text-primary mb-1 text-center">
                  {title}
                </h2>
                <p className="text-slate-500 text-center font-medium">
                  {characterName}
                </p>
              </div>
            </div>

            {/* 뒷면 - 상세 정보 */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl shadow-2xl overflow-hidden">
              {/* 배경 이미지 */}
              <div className="absolute inset-0">
                <Image
                  src={imageUrl}
                  alt={`${characterName} 캐릭터`}
                  width={450}
                  height={660}
                  className="w-full h-full object-cover"
                />
                {/* 어두운 오버레이 - 더 밝게 수정 */}
                <div className="absolute inset-0 bg-black/20"></div>
                {/* 그라데이션 오버레이 - 더 밝게 수정 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/10"></div>
              </div>

              {/* 메인 콘텐츠 영역 */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-2xl">
                  {/* 타이틀 */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[#F6C851] mb-2">
                      {title}
                    </h3>
                    <p className="text-white/90 font-medium text-[#F6C851]">
                      {characterName}
                    </p>
                  </div>

                  {/* 슬로건 */}
                  <div className="mb-6">
                    <blockquote className="text-white font-semibold text-center leading-relaxed text-lg italic">
                      &ldquo;{slogan}&rdquo;
                    </blockquote>
                  </div>

                  {/* 설명 */}
                  <div className="mb-6">
                    <p className="text-white/95 leading-relaxed text-sm font-medium text-center">
                      {description}
                    </p>
                  </div>

                  {/* 추천 여행지 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-white/95 mb-3 text-center">
                      추천 여행지
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {recommendedPlaces.map((place: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs font-semibold text-white"
                        >
                          ✨ {place}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 돌아가기 힌트 */}
                  <div className="flex justify-center items-center text-white/70">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span className="text-xs font-medium">
                      다시 터치해서 돌아가기
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-4">
          {/* 공유 버튼들 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareFrontCard}
              disabled={isDownloading}
              className="bg-accent text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  처리 중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  앞면 공유
                </>
              )}
            </button>

            <button
              onClick={shareBackCard}
              disabled={isDownloading}
              className="bg-accent text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  처리 중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  뒷면 공유
                </>
              )}
            </button>
          </div>

          {/* 카드 다운로드 버튼들 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadFrontCard}
              disabled={isDownloading}
              className="bg-white text-slate-700 py-3 px-4 rounded-xl font-bold text-sm border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  다운로드 중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  앞면 저장
                </>
              )}
            </button>

            <button
              onClick={downloadBackCard}
              disabled={isDownloading}
              className="bg-white text-slate-700 py-3 px-4 rounded-xl font-bold text-sm border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  다운로드 중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  뒷면 저장
                </>
              )}
            </button>
          </div>

          {/* 다시 테스트하기 */}
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full text-slate-500 py-3 font-semibold hover:text-slate-700 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            다시 테스트하기
          </button>
        </div>
      </div>

      {/* 푸터 */}
      <div className="text-center mt-16 text-slate-400">
        <p className="text-lg font-medium">
          어떤 여행이든, 당신만의 특별한 이야기가 될거예요 ✨
        </p>
      </div>

      {/* 여행 챗봇 */}
      <TravelChatbot
        recommendedPlaces={recommendedPlaces}
        characterName={characterName}
        title={title}
        description={description}
      />
    </div>
  );
};

export default ResultPageInner;
