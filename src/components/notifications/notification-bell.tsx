"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/context/notifications-context";
import { Modal } from "@/components/ui/modal";
import NotificationsList from "./notifications-list";

export default function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    enabled,
    notifications,
    pollForMessages,
    hasUnreadNotifications,
    setHasUnreadNotifications,
  } = useNotifications();

  // Poll for notifications when component mounts
  useEffect(() => {
    if (enabled) {
      pollForMessages();

      // Set up polling interval
      const interval = setInterval(() => {
        pollForMessages();
      }, 60000); // Poll every minute

      return () => clearInterval(interval);
    }
  }, [enabled, pollForMessages]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Mark notifications as read when opening the modal
    setHasUnreadNotifications(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {enabled && hasUnreadNotifications && (
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
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
