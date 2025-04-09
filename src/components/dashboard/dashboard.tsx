"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import ProjectsList from "./projects-list";

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [view, setView] = useState<"projects" | "editor">("projects");

  const handleCreateProject = (name: string) => {
    setSelectedProject(name);
    setView("editor");
  };

  const handleSelectProject = (name: string) => {
    setSelectedProject(name);
    setView("editor");
  };

  const handleBackToProjects = () => {
    setView("projects");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={view} onNavigate={setView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={
            view === "projects" ? "Projects" : selectedProject || "New Project"
          }
          showBackButton={view === "editor"}
          onBackClick={handleBackToProjects}
        />
        <main className="flex-1 overflow-hidden bg-gray-50">
          <ProjectsList
            onCreateProject={handleCreateProject}
            onSelectProject={handleSelectProject}
          />
        </main>
      </div>
    </div>
  );
}
