import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useMutation } from '@tanstack/react-query';
import Images from "@/shared/assets/images";
import storeResult from '@/entities/AI/api/stroeResult';
import storeDescription from '@/entities/AI/api/storeDescription';
import OpenAI from 'openai';
import { TopTitle } from '@/shared/components/ui';
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import useWalletStore from '@/shared/store/useWalletStore';

const DentalAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const { playSfx } = useSound();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [label, setLabel] = useState(t("ai_page.Upload_an_X-ray_image_to_start_analysis"));
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ isVisible: false, message: '' });
  const [analysisResult, setAnalysisResult] = useState<any[]>([]);
  const [imageType, setImageType] = useState<string>("unknown");
  const petData = location.state as { id: string };
  const petId = petData?.id || '';

  const { walletAddress } = useWalletStore();

  const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
      dangerouslyAllowBrowser: true,
  });

  // 진단 증상이름과 내용 (기존)
  const symptomsInfo: Record<string, string> = {
      "Gingivitis & Plaque": t("ai_page.reuslts.symptoms_of_gingivitis_and_plaque"),
      "Periodontitis": t("ai_page.reuslts.symptoms_of_periodontitis"),
      "Normal": t("ai_page.reuslts.no_issues_detected"),
      "Gingivitis": t("ai_page.reuslts.symptoms_of_gingivitis"),
  };

  // label(진단명)에 매칭되는 설명을 반환
  const getSymptomDescription = (diagLabel: string) =>
      symptomsInfo[diagLabel] || t("ai_page.Diagnosis_information_not_available");

  // 모달 표시
  const showModalFunction = (message: string) => {
      setModalInfo({ isVisible: true, message });
  };

  // 이미지 업로더
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    playSfx(Audios.button_click);
  
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      setLabel(t("ai_page.Click_the_button_to_analyze_the_uploaded_image"));
      setExplanation("");
      setIsAnalyzed(false);
    }
  };

  // File -> Base64 문자열로 변환
  async function convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject("Failed to convert file to base64.");
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // 이미지 확장자 추출 (mimeType 기반)
  function getImageExtension(file: File): string {
    const mimeType = file.type;
    const extension = mimeType.split("/")[1] || "jpeg";
    return extension;
  }

  async function retryWithBackoff(fn: () => any, retries = 5, delay = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            if (error.response?.status === 429) {
                const backoffTime = delay * Math.pow(2, i);
                await new Promise((resolve) => setTimeout(resolve, backoffTime));
            } else {
                throw error;
            }
        }
    }
    throw new Error('429 Too Many Requests: 최대 재시도 횟수 초과');
  }

  // 이미지 분석 함수
  const analyzeImage = async () => {
    playSfx(Audios.button_click);
    let useLanguage = "English";
    
    if (i18n.language === "ko") {
      useLanguage = "Korean";
    } else if (i18n.language === "ja") {
      useLanguage = "Japanese";
    } else if (i18n.language === "zh" || i18n.language === "zh") {
      useLanguage = "Taiwanese";
    } else if (i18n.language === "th") {
      useLanguage = "Thai";
    } else {
      useLanguage = "English";
    }

    if (!selectedImage) {
      showModalFunction(t("ai_page.Please_upload_an_image_before_analysis."));
      return;
    }

    setLoading(true);

    try {
      const base64Data = await convertFileToBase64(selectedImage);

      const response = await retryWithBackoff(() => openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
              You are an AI specialized in pet dental analysis.
              Please respond exclusively in ${useLanguage}.
              1) Return "image_type": one of ['dog','cat','x-ray','other'].
              2) Return "analysis": an array of objects => { disease_name, probability, description, caution } 
                - probability: number(0~1)
                - description: a detailed explanation
                - caution: any warnings or tips
              3) Return "is_tooth": a boolean indicating if the dog's or cat's teeth are clearly visible.
              4) Write all text responses in ${useLanguage}.
            `,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/${getImageExtension(selectedImage)};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "pet_dental_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                image_type: {
                  type: "string",
                  enum: ["dog", "cat", "x-ray", "other"],
                },
                is_tooth: {
                  type: "boolean",
                  description: "Whether the pet's teeth are visible in the image.",
                },
                analysis: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      disease_name: {
                        type: "string",
                        description: `Disease name in ${useLanguage}.`,
                      },
                      probability: {
                        type: "number",
                        description: "A number between 0 and 1 indicating the likelihood of this disease.",
                      },
                      description: {
                        type: "string",
                        description: `A detailed explanation of the disease in ${useLanguage}.`,
                      },
                      caution: {
                        type: "string",
                        description: `Any warnings or tips in ${useLanguage}.`,
                      },
                    },
                    required: ["disease_name", "probability", "description", "caution"],
                    additionalProperties: false,
                  },
                  description: "A list of possible diagnoses with their probabilities and explanations.",
                },
              },
              required: ["image_type", "analysis", "is_tooth"],
              additionalProperties: false,
            },
          },
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }));

      const assistantMessage = response?.choices?.[0]?.message?.content?.trim() || "(No response)";
      const parsedData = JSON.parse(assistantMessage);
      const { image_type, analysis, is_tooth } = parsedData;

      try {
        if (image_type === "x-ray") {
          showModalFunction(t("ai_page.actual_photo"));
          setIsAnalyzed(false);
          setSelectedImage(null);
          setLabel("X ray");
          setExplanation("");
        } else if (image_type === "other") {
          showModalFunction(t("ai_page.Please_upload_tooth_image"));
          setIsAnalyzed(false);
          setSelectedImage(null);
          setLabel("Non dental");
          setExplanation("");
        } else if (!is_tooth) { 
          showModalFunction(t("ai_page.Please_upload_pets_tooth_image"));
          setIsAnalyzed(false);
          setLabel("Non dental");
          setSelectedImage(null);
          setExplanation("");
        } else if ((image_type === "dog" || image_type === "cat") && is_tooth) {
          setIsAnalyzed(true);
          setImageType(image_type);
          setAnalysisResult(analysis);
          
          const firstAnalysis = parsedData.analysis[0];
          setLabel(firstAnalysis.disease_name);
          setExplanation(firstAnalysis.description);
          setIsAnalyzed(true);
        } else {
          showModalFunction(t("ai_page.Failed_to_analyze_the_image"));
          setIsAnalyzed(false);
          setSelectedImage(null);
          setLabel(t("ai_page.Analysis_failed"));
          setExplanation("");
        }
      } catch (error) {
        showModalFunction(t("ai_page.Failed_to_analyze_the_image"));
        setIsAnalyzed(false);
        setSelectedImage(null);
        setLabel(t("ai_page.Analysis_failed"));
        setExplanation("");
      }            
    } catch (error: any) {
      setIsAnalyzed(false);
      setSelectedImage(null);
      showModalFunction(t("ai_page.Failed_to_analyze_the_image"));
    } finally {
      setLoading(false);
    }
  };

  // 결과 저장 mutation
  const { mutate: saveResultMutate, isPending: isSaving } = useMutation({
    mutationFn: (formData: FormData) => storeDescription(formData),
    onSuccess: () => navigate('/AI-menu', { state: { id: petId } }),
    onError: () => showModalFunction(t("ai_page.Failed_to_save_result._Please_try_again.")),
  });

  // 결과 저장 함수
  const saveResult = () => {
    playSfx(Audios.button_click);

    if (!selectedImage || !isAnalyzed) {
      showModalFunction(t("ai_page.Please_analyze_the_image_before_saving."));
      return;
    }

    const limitedAnalysis = analysisResult.slice(0, 3);

    const payload = {
      petId,
      details: limitedAnalysis.map((item) => ({
        label: item.disease_name,
        probability: Math.round(item.probability * 100),
        description: item.description,
        caution: item.caution,
      })),
    };

    const formData = new FormData();
    formData.append(
      "json",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    formData.append("file", selectedImage);

    saveResultMutate(formData);
  };

  // 재검사 진행 버튼 함수
  const resetAnalysis = () => {
    playSfx(Audios.button_click);
    setLabel(t("ai_page.Upload_an_X-ray_image_to_start_analysis"));
    setSelectedImage(null);
    setExplanation("");
    setIsAnalyzed(false);
  };

  return (
    <div className="flex flex-col items-center text-white mx-6 h-screen overflow-x-hidden">
      <TopTitle title={t('ai_page.ai_dental_examination')} back={true} />

      <div className="mt-6 w-full max-w-sm mx-auto p-2 flex flex-col items-center">
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="cursor-pointer w-[280px] h-[280px] flex flex-col items-center justify-center rounded-3xl border-2 bg-[#2E3364B2] border-[#3937A3] overflow-hidden">
          {selectedImage ? (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Uploaded X-ray"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <img
                src={Images.UploadArrow} 
                alt="Upload arrow"
                className="w-20 h-20 mb-6"
              />
              <p className="text-white font-medium text-base whitespace-nowrap">{t("ai_page.click_here")}</p>
            </>
          )}
        </label>
      </div>

      {!isAnalyzed && (
        <div className="mt-6 w-full max-w-lg mx-auto">
          <button
            className={`w-full h-14 text-white text-base font-medium py-2 px-4 rounded-full ${loading ? 'cursor-wait' : ''}`}
            style={{ backgroundColor: '#0147E5' }}
            onClick={analyzeImage}
            disabled={loading}
          >
            {loading ? t("ai_page.Analyzing...") : t("ai_page.Upload_image_and_analysis")}
          </button>
        </div>
      )}

      {isAnalyzed && (
        <>
          <div className="mt-4 text-lg font-semibold">
            <p>Analysis results (image_type: {imageType})</p>
          </div>

          <div className="mt-4 p-4 bg-gray-800 rounded-xl max-w-sm mx-auto">
            {analysisResult.map((item, idx) => (
              <div key={idx} className="mb-4">
                <p className="font-semibold text-base">{item.disease_name} ({Math.round(item.probability*100)}%)</p>
                <p className={`overflow-hidden text-sm`}>
                  {item.description}
                </p>
                <p className="text-sm text-red-300 mt-1">{item.caution}</p>
              </div>
            ))}
          </div>

          <div className="flex w-full max-w-sm justify-between mt-10 mb-16">
            <button
              className="w-[48%] h-14 text-white text-base py-2 px-4 rounded-full border-2"
              style={{ backgroundColor: '#252932', borderColor: '#35383F' }}
              onClick={resetAnalysis}
            >
              {t('ai_page.Retest')} 
            </button>
            <button
              className={`w-[48%] h-14 text-white text-base py-2 px-4 rounded-full ${isSaving ? 'cursor-wait' : ''}`}
              style={{ backgroundColor: isSaving ? '#555' : '#0147E5' }}
              onClick={saveResult}
              disabled={isSaving}
            >
              {isSaving ? t("ai_page.Saving") : t("ai_page.Save")}
            </button>
          </div>
        </>
      )}

      {(showModal || modalInfo.isVisible) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full">
          <div className="bg-white p-6 rounded-lg text-black text-center w-[70%] max-w-[550px]">
            <p>
              {modalInfo.isVisible
                ? modalInfo.message
                : t("ai_page.Please_upload_an_image_before_analysis.")}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-[#0147E5] text-white rounded-lg"
              onClick={() => {
                playSfx(Audios.button_click);
                setShowModal(false);
                setModalInfo({ isVisible: false, message: '' });
              }}
            >
              {t("OK")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DentalAnalysis;
