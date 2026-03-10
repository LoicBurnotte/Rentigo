"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatWindow } from "@/components/messages/chat-window";
import { useAuth } from "@/providers/auth-provider";
import { PageLoading } from "@/components/ui/loading";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default function ConversationPage({ params }: Props) {
  const { conversationId } = use(params);
  const { user, loading } = useAuth();
  const t = useTranslations("messages");

  if (loading) return <PageLoading />;
  if (!user) return null;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          {t("backToMessages")}
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow conversationId={conversationId} />
      </div>
    </div>
  );
}
