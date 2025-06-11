"use client";

import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function DiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const supabase = createSupabaseBrowserClient();

  const [post, setPost] = useState<{
    title: string;
    content: string;
    image_url: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("posts")
        .select("title, content, image_url")
        .eq("id", postId)
        .single();
      if (data) setPost(data);
    };
    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (!error) router.push("/diary");
    }
  };

  if (!post) return <div>로딩중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p>{post.content}</p>
      {post.image_url && (
        <img
          src={post.image_url}
          alt="게시글 이미지"
          className="mt-4 w-full max-h-64 object-contain"
        />
      )}
      <button
        onClick={handleDelete}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        삭제
      </button>
    </div>
  );
}
