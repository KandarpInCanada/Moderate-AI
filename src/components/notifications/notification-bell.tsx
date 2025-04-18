"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/context/notifications-context";
import { Modal } from "@/components/ui/modal";
import NotificationsList from "./notifications-list";

export default function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { enabled, queueUrl, notifications, pollForMessages } =
    useNotifications();

  const handleOpenModal = () => {
    setIsModalOpen(true);
    pollForMessages();
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {enabled && queueUrl && notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Notifications"
      >
        <NotificationsList />
      </Modal>
    </>
  );
}
