
'use client';

import React, { useState, useMemo } from 'react';
import { Project, User, UserRole } from '../types';
import AuditReport from './AuditReport';

// @google/genai: Fixed ProjectListProps to make onEdit optional
interface ProjectListProps {
  projects: Project[];
  type: 'upcoming' | 'completed';
  onEdit?: (project: Project) => void;
  currentUser: User;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, type, onEdit, currentUser }) => {
  const [selectedAuditProject, setSelectedAuditProject] = useState<Project | null>(null);
  const [previewImage, setPreviewImage] = useState<{ data: string, name: string } | null>(null);
  const [previewImageBudgetCopy, setPreviewImageBudgetCopy] = useState<{ data: string, name: string } | null>(null);
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const sortedAndFilteredProjects = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return projects
      .filter(p => {
        const endDate = new Date(p.endDate);
        const isCompleted = endDate < today;
        return type === 'completed' ? isCompleted : !isCompleted;
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [projects, type]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);

  const handleExportCSV = () => {
    if (sortedAndFilteredProjects.length === 0) return;

    const headers = [
      'Project ID',
      'Project Name',
      'Start Date',
      'End Date',
      'Budget Amount (BDT)',
      'Advance Amount (BDT)',
      'Expense Amount (BDT)',
      'Balance Amount (BDT)',
      'Bill Submission Date',
      'SOP ROI Submission Date'
    ];

    const rows = sortedAndFilteredProjects.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.startDate,
      p.endDate,
      p.budgetAmount,
      p.advanceAmount,
      p.expenseAmount,
      p.balanceAmount,
      p.billSubmissionDate || 'N/A',
      p.sopRoiEmailSubmissionDate || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Include UTF-8 BOM for Excel compatibility
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `Akij_Ledger_Export_${type}_${dateStamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedAuditProject) {
    return (
      <AuditReport
        project={selectedAuditProject}
        currentUser={currentUser}
        onBack={() => setSelectedAuditProject(null)}
        onEdit={isAdmin && onEdit ? () => {
          onEdit(selectedAuditProject);
          setSelectedAuditProject(null);
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {type === 'completed' ? 'Completed Projects' : 'Upcoming & Ongoing Projects'}
          </h2>
          <p className="text-slate-500">
            {type === 'completed'
              ? 'Review finished projects and their final financial tallies.'
              : 'Monitor active and scheduled initiatives.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
            <i className="fas fa-sort-amount-down"></i>
            <span>Sorted: Newest Start Date</span>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={sortedAndFilteredProjects.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sortedAndFilteredProjects.length > 0
              ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            <i className="fas fa-file-export"></i>
            Export Data
          </button>
        </div>
      </header>

      {sortedAndFilteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-folder-open text-slate-300 text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Projects Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">There are currently no {type} projects in the ledger database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedAndFilteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-emerald-300 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-bold text-slate-800">{project.name}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${type === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {type === 'completed' ? 'Completed' : 'Live'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><i className="far fa-calendar text-slate-400"></i> {formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
                    <span className="flex items-center gap-1.5"><i className="fas fa-coins text-slate-400"></i> Budget: {formatCurrency(project.budgetAmount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="text-center px-3 py-1 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Expense</p>
                    <p className="text-sm font-bold text-red-600">{formatCurrency(project.expenseAmount)}</p>
                  </div>
                  <div className="text-center px-3 py-1 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Balance</p>
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(project.balanceAmount)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                  {
                    project.budgetCopyAttachment && (
                      <button
                        onClick={() => setPreviewImageBudgetCopy({ data: project.budgetCopyAttachment!.data, name: 'Budget Copy Attachment' })}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Budget Copy Attachment"
                      >
                        <i className="fas fa-file-invoice-dollar"></i>
                      </button>
                    )
                  }
                  {project.billTopSheetImage && (
                    <button
                      onClick={() => setPreviewImage({ data: project.billTopSheetImage!.data, name: 'Bill Top Sheet' })}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Bill Top Sheet"
                    >
                      <i className="fas fa-file-invoice-dollar"></i>
                    </button>
                  )}

                  {isAdmin && onEdit && (
                    <button
                      onClick={() => onEdit(project)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Edit Record"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAuditProject(project)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all"
                  >
                    <i className="fas fa-file-export"></i>
                    Audit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImageBudgetCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{previewImageBudgetCopy.name}</h3>
              <button onClick={() => setPreviewImageBudgetCopy(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 p-6 flex justify-center">
              <img src={previewImageBudgetCopy.data} alt={previewImageBudgetCopy.name} className="max-w-full h-auto rounded shadow-lg" />
            </div>
            <div className="p-4 bg-white border-t text-right">
              <button onClick={() => setPreviewImageBudgetCopy(null)} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold">Close Preview</button>
            </div>
          </div>
        </div>
      )}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{previewImage.name}</h3>
              <button onClick={() => setPreviewImage(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 p-6 flex justify-center">
              <img src={previewImage.data} alt={previewImage.name} className="max-w-full h-auto rounded shadow-lg" />
            </div>
            <div className="p-4 bg-white border-t text-right">
              <button onClick={() => setPreviewImage(null)} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
