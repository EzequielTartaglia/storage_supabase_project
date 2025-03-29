"use client";

import React, { useState } from "react";
import { FaEye, FaQuestionCircle } from "react-icons/fa";
import parseTextWithColor from "@/src/helpers/parseTextWithColor";

const TextArea = ({
  label,
  name,
  value,
  placeholder,
  onChange,
  isSubmitted,
  errorMessage,
  required,
  rows = 4,
  note,
  hasHightlightTexts = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTipVisible, setIsTipVisible] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleTip = () => setIsTipVisible(!isTipVisible);

  return (
    <div className="flex flex-col relative mt-2">
      <label
        htmlFor={name}
        className="flex gap-1 my-2 text-primary font-semibold"
      >
        <span>{label}</span>
        {required && <span className="text-title-active-static">*</span>}
      </label>

      {hasHightlightTexts ? (
        <div className="flex items-start">
          <textarea
            id={name}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={`w-full rounded-[5px] p-1 text-black focus-visible:outline-none resize-none border-2 ${
              isSubmitted && required && !value
                ? "border-red-500"
                : "border-transparent focus:border-primary"
            }`}
            rows={rows}
          />
          <div className="flex flex-col items-end ml-2">
            <button
              type="button"
              className="mt-4 mb-2 text-primary border border-transparent rounded-full bg-white p-2"
              onClick={toggleTip}
              title="Formato"
            >
              <FaQuestionCircle size={16} />
            </button>
            <button
              type="button"
              className="mb-2 text-primary border border-transparent rounded-full bg-white p-2"
              onClick={openModal}
              title="Ver previsualizacion con formato"
            >
              <FaEye size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start">
          <textarea
            id={name}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={`w-full rounded-[5px] p-1 text-black focus-visible:outline-none resize-none border-2 ${
              isSubmitted && required && !value
                ? "border-red-500"
                : "border-transparent focus:border-primary"
            }`}
            rows={rows}
          />
        </div>
      )}
      {isTipVisible && (
        <div className="mt-2 bg-gray-100 p-2 rounded border border-gray-300 text-sm">
          Formato: Para resaltar palabras escribir el formato{" "}
          <strong>**texto a resaltar**</strong>
        </div>
      )}

      {note && (
        <span className="text-title-active-static text-sm mt-1">{note}</span>
      )}

      {isSubmitted && required && !value && (
        <span className="text-danger">{errorMessage}</span>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-4xl mx-4 border border-gray-300 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Previsualizacion con formato
            </h2>
            <div className="overflow-y-auto">
              <p className="text-primary p-4 bg-white shadow-md rounded-md leading-relaxed font-semibold whitespace-pre-wrap">
                {parseTextWithColor(value)}
              </p>
            </div>
            <button
              type="button"
              className="mt-4 bg-red-500 font-semibold text-white hover:bg-red-600 rounded-md p-2"
              onClick={closeModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextArea;
