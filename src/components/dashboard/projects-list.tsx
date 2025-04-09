"use client";

import { useState } from "react";
import { Plus, Search, MoreVertical, Calendar, Clock } from "lucide-react";

// Sample project data
const sampleProjects = [
  {
    id: "1",
    name: "AWS Web Application",
    description:
      "3-tier web application with load balancer, EC2 instances, and RDS",
    lastModified: "2 days ago",
    created: "Apr 2, 2025",
  },
  {
    id: "2",
    name: "Serverless API",
    description: "API Gateway with Lambda functions and DynamoDB",
    lastModified: "1 week ago",
    created: "Mar 28, 2025",
  },
  {
    id: "3",
    name: "Data Pipeline",
    description: "S3 to Redshift data pipeline with Glue",
    lastModified: "3 weeks ago",
    created: "Mar 15, 2025",
  },
];

interface ProjectsListProps {
  onCreateProject: (name: string) => void;
  onSelectProject: (name: string) => void;
}

export default function ProjectsList({
  onCreateProject,
  onSelectProject,
}: ProjectsListProps) {
  const [projects, setProjects] = useState(sampleProjects);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName);
      setNewProjectName("");
      setShowCreateModal(false);
    }
  };
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectProject(project.name)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-gray-900">
                  {project.name}
                </h3>
                <button className="text-gray-500 hover:text-gray-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-700 mt-2 text-sm">
                {project.description}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {project.created}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {project.lastModified}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Create New Project
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
