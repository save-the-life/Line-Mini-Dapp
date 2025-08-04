import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopTitle } from "@/shared/components/ui";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import updateNickname from "@/entities/User/api/updateNickname";
import { useUserStore } from "@/entities/User/model/userModel";

const EditNickname: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { playSfx } = useSound();
  const { nickName } = useUserStore();

  const [newNickname, setNewNickname] = useState(nickName ?? "");

  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 완료 버튼 클릭 (닉네임 수정)
  const editBtn = async () => {
    playSfx(Audios.button_click);

    if (!newNickname) {
      setShowModal(true);
      setModalMessage("Please provide the new Nickname.");
      return;
    }

    try {
      const updateNick = await updateNickname(newNickname);

      if (updateNick.message === "Success") {
        navigate("/dice-event");
      } else if (updateNick.message === "Exist User Name.") {
        setShowModal(true);
        setModalMessage(t("setting.duplicate"));
      } else {
        setShowModal(true);
        setModalMessage(t("asset_page.try_again"));
      }
    } catch (error: any) {
      // console.log("error 확인: ", error);
      setShowModal(true);
      setModalMessage(t("asset_page.try_again"));
    }
  };

  return (
    <div className="flex flex-col items-center mx-6 relative min-h-screen pb-20">
      <TopTitle title="닉네임 수정" back={true} />

      {/* 이름 입력란 */}
      <div className="mt-8 w-full">
        <input
          type="text"
          placeholder="당신의 닉네임을 정해주세요!"
          value={newNickname}
          onChange={(e) => setNewNickname(e.target.value)}
          maxLength={8}
          className="w-full p-4 rounded-2xl mb-4 focus:outline-none"
          style={{
            backgroundColor: "rgba(0, 136, 255, 0.75)",
            backdropFilter: "blur(10px)",
            boxShadow: "0px 2px 2px 0px rgba(0, 0, 0, 0.4)",
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        />
      </div>
      <div className="w-full mt-3 text-center">
        <p
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        >
          * 닉네임은 최대 8자까지 사용할 수 있습니다.
        </p>
      </div>

      {/* 취소 및 수정 버튼을 하단에 고정 */}
      <div className="w-full max-w-md absolute bottom-16 left-1/2 transform -translate-x-1/2 flex justify-between gap-4">
        <button
          className="w-1/2 py-4 rounded-full text-base font-medium border-4"
          style={{
            backgroundColor: "#252932",
            borderColor: "#35383F",
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
          onClick={() => {
            navigate(-1);
          }}
        >
          취소
        </button>
        <button
          className="w-1/2 py-4 rounded-full text-base font-medium"
          onClick={editBtn}
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        >
          편집
        </button>
      </div>

      {/* 모달창 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-lg text-center">
            <p>{modalMessage}</p>
            <button
              className="mt-4 px-4 py-2 bg-[#0147E5] text-white rounded-lg"
              onClick={() => setShowModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditNickname;
