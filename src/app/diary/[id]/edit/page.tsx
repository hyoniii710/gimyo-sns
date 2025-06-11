/*
파일: /app/diary/[id]/edit/page.tsx
설명:
게시글 수정 폼에서 입력받은 값으로 데이터 업데이트
*/

"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function DiaryEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const supabase = createSupabaseBrowserClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("posts")
        .select("title, content")
        .eq("id", postId)
        .single();
      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
    };
    fetchPost();
  }, [postId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("posts")
      .update({ title, content })
      .eq("id", postId);
    if (!error) router.push(`/diary/${postId}`);
  };

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용"
        required
      />
      <button type="submit">수정</button>
    </form>
  );
}
