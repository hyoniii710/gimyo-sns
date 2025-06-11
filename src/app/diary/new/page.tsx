/*
파일: /app/diary/new/page.tsx
목적: 일기장에 글을 작성하여 저장
설명: 클라이언트 컴포넌트에서 폼 입력을 받아 Supabase에 저장*/
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function DiaryNewPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const supabase = createSupabaseBrowserClient();

  // 이미지 미리보기
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("diary_images")
      .upload(fileName, file);
    if (error) throw error;
    // 업로드된 이미지의 public URL 반환
    const {
      data: { publicUrl },
    } = supabase.storage.from("diary_images").getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image, user.id);
    }

    // 일기 등록
    const { error } = await supabase
      .from("posts")
      .insert({ title, content, user_id: user.id, image_url: imageUrl });
    if (!error) router.push("/diary");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold mb-2">이미지 업로드</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="mb-2"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="미리보기"
              className="max-w-xs h-auto mb-2 rounded"
            />
          )}
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          placeholder="제목"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          placeholder="내용"
          required
          rows={6}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          등록
        </button>
      </form>
    </div>
  );
}
