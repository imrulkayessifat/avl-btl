
'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectAttachment } from '../types';

interface ProjectFormProps {
  onAdd: (project: Project) => Promise<void>;
  onUpdate?: (project: Project) => Promise<void>;
  projectToEdit?: Project;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onAdd, onUpdate, projectToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budgetAmount: 0,
    advanceAmount: 0,
    expenseAmount: 0,
    billSubmissionDate: '',
    sopRoiEmailSubmissionDate: '',
  });

  const [billTopSheet, setBillTopSheet] = useState<ProjectAttachment | null>(null);
  const [budgetCopy, setBudgetCopy] = useState<ProjectAttachment | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        name: projectToEdit.name,
        startDate: projectToEdit.startDate,
        endDate: projectToEdit.endDate,
        budgetAmount: projectToEdit.budgetAmount,
        advanceAmount: projectToEdit.advanceAmount,
        expenseAmount: projectToEdit.expenseAmount,
        billSubmissionDate: projectToEdit.billSubmissionDate || '',
        sopRoiEmailSubmissionDate: projectToEdit.sopRoiEmailSubmissionDate || '',
      });
      if (projectToEdit.billTopSheetImage) setBillTopSheet(projectToEdit.billTopSheetImage);
      if (projectToEdit.budgetCopyAttachment) setBudgetCopy(projectToEdit.budgetCopyAttachment);
    }
  }, [projectToEdit]);

  const balanceAmount = formData.advanceAmount - formData.expenseAmount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (att: ProjectAttachment) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setter({
        name: file.name,
        type: file.type,
        data: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const payload: Project = {
      ...formData,
      id: projectToEdit ? projectToEdit.id : crypto.randomUUID(),
      balanceAmount,
      billTopSheetImage: billTopSheet || undefined,
      budgetCopyAttachment: budgetCopy || undefined,
      createdAt: projectToEdit ? projectToEdit.createdAt : new Date().toISOString(),
    };

    if (projectToEdit && onUpdate) {
      await onUpdate(payload);
    } else {
      await onAdd(payload);
    }
  };

  const handleNumericFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleNumericChange = (field: string, value: string) => {
    const num = value === '' ? 0 : parseFloat(value);
    setFormData({ ...formData, [field]: isNaN(num) ? 0 : num });
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${projectToEdit ? 'bg-amber-500' : 'bg-blue-600'}`}>
          <i className={`fas ${projectToEdit ? 'fa-edit' : 'fa-file-invoice'} text-xl`}></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {projectToEdit ? 'Edit Project Entry' : 'New Project Entry'}
          </h2>
          <p className="text-slate-500">
            {projectToEdit ? `Update details for: ${projectToEdit.name}` : 'Record a new project initiative with full financial details.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Project Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Project Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="e.g. Q4 Marketing Campaign"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Bill Submission Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={formData.billSubmissionDate}
                onChange={e => setFormData({ ...formData, billSubmissionDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Project Start Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Project End Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">SOP & ROI Email Submission Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.sopRoiEmailSubmissionDate}
                onChange={e => setFormData({ ...formData, sopRoiEmailSubmissionDate: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Financial Ledger</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Budget Amount (৳)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.budgetAmount === 0 ? '' : formData.budgetAmount}
                onFocus={handleNumericFocus}
                onChange={e => handleNumericChange('budgetAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Advance Amount (৳)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.advanceAmount === 0 ? '' : formData.advanceAmount}
                onFocus={handleNumericFocus}
                onChange={e => handleNumericChange('advanceAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Expense Amount (৳)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.expenseAmount === 0 ? '' : formData.expenseAmount}
                onFocus={handleNumericFocus}
                onChange={e => handleNumericChange('expenseAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Balance Amount (৳)</label>
              <div className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-bold">
                {new Intl.NumberFormat('en-GB', { 
                  style: 'currency', 
                  currency: 'BDT',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(balanceAmount)}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Attachments & Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
              <i className="fas fa-image text-slate-300 text-3xl mb-3"></i>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bill Top Sheet Image</label>
              <input
                type="file"
                accept="image/*"
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e => handleFileChange(e, setBillTopSheet)}
              />
              {billTopSheet && <p className="mt-2 text-xs text-green-600 font-medium"><i className="fas fa-check"></i> {billTopSheet.name} attached</p>}
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
              <i className="fas fa-paperclip text-slate-300 text-3xl mb-3"></i>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget Copy Attachment</label>
              <input
                type="file"
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                onChange={e => handleFileChange(e, setBudgetCopy)}
              />
              {budgetCopy && <p className="mt-2 text-xs text-green-600 font-medium"><i className="fas fa-check"></i> {budgetCopy.name} attached</p>}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            onClick={() => window.location.reload()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-8 py-2.5 rounded-lg text-white font-semibold shadow-lg transition-all ${projectToEdit ? 'bg-amber-600 shadow-amber-200 hover:bg-amber-700' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}
          >
            {projectToEdit ? 'Update Project Record' : 'Create Project Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
