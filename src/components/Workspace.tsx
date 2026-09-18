import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Plus,
  Search,
  Filter,


  Play,
  Pause,
  FileText,
  FileSignature,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { DocumentStudio } from './DocumentStudio';
import { ServiceCatalog } from './ServiceCatalog';
import type { DocumentKind } from '../documents/generate';

import type { Client, Project } from '../types';
import { ProjectModal } from './ProjectModal';
import { ClientModal } from './ClientModal';

export const Workspace = () => {
  const {
    projects,
    clients,
    getClientById,
    activeTimeEntry,
    startTimer,
    stopTimer,
    deleteProject
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [documentRequest,setDocumentRequest] = useState<{kind:DocumentKind;project:Project}|null>(null);
  const [projectClientId,setProjectClientId] = useState<string|undefined>();
  const [editingClient,setEditingClient] = useState<Client|undefined>();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const client = getClientById(project.clientId);
    const matchesSearch =
      project.refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.projectStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleGenerateInvoice = (id:string) => { const project = projects.find(p=>p.id===id); if(project) setDocumentRequest({kind:'invoice',project}); };
  const handleGenerateContract = (id:string) => { const project = projects.find(p=>p.id===id); if(project) setDocumentRequest({kind:'contract',project}); };
  const handleToggleTimer = (projectId: string) => {
    if (activeTimeEntry?.projectId === projectId) {
      stopTimer();
    } else {
      if (activeTimeEntry) stopTimer();
      startTimer(projectId);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'paused': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'cancelled': return 'bg-canvas text-ink bg-surface/30 text-muted';
      default: return 'bg-canvas text-ink';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'partial': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-canvas text-ink';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Workspace</h1>
          <p className="text-sm text-muted mt-1">
            Manage your clients and projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {setEditingClient(undefined);setIsClientModalOpen(true);}}
            className="flex items-center gap-2 px-4 py-2 bg-canvas bg-surface text-ink text-muted rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Client
          </button>
          <button
            onClick={() => {
              setEditingProject(undefined);
              setProjectClientId(undefined);
              setIsProjectModalOpen(true);
            }}
            className="primary-button flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      <ServiceCatalog />
      <section className="panel"><div className="section-heading"><div><h2>Clients <span className="text-muted">{clients.length}</span></h2><p>Select a client to edit contact details and logo.</p></div></div><div className="catalog-grid">{clients.map(client=><button key={client.id} className="catalog-item" onClick={()=>{setEditingClient(client);setIsClientModalOpen(true);}}>{client.logoUrl&&<img src={client.logoUrl} alt="" className="h-10 w-14 object-contain"/>}<strong>{client.businessName}</strong><small>{client.refId} · {client.contactPerson}</small></button>)}{!clients.length&&<p>No clients yet. Create your first client above.</p>}</div></section>
      {/* Filters */}
      <div className="bg-surface rounded-lg border border-line p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by client, ref ID, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas bg-surface border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-ink"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-canvas bg-surface border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-ink"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-surface rounded-lg border border-line p-12 text-center">
            <p className="text-muted">No projects found</p>
          </div>
        ) : (
          filteredProjects.map(project => {
            const client = getClientById(project.clientId);
            const isTimerActive = activeTimeEntry?.projectId === project.id;

            return (
              <div
                key={project.id}
                className="bg-surface rounded-lg border border-line p-5 hover:border-primary/50 transition-colors"
                style={{ borderLeftWidth: '4px', borderLeftColor: client?.color || '#0b58bd' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-ink">
                        {client?.businessName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(project.projectStatus)}`}>
                        {project.projectStatus.charAt(0).toUpperCase()+project.projectStatus.slice(1)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPaymentStatusColor(project.paymentStatus)}`}>
                        {project.paymentStatus.charAt(0).toUpperCase()+project.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span className="font-semibold text-primary">{project.refId}</span>
                      <span>•</span>
                      <span>{client?.contactPerson}</span>
                      <span>•</span>
                      <span>{client?.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleTimer(project.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isTimerActive
                          ? 'bg-green-500 text-ink hover:bg-green-600'
                          : 'bg-canvas bg-surface text-muted text-muted hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                      title={isTimerActive ? 'Stop timer' : 'Start timer'}
                    >
                      {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleGenerateInvoice(project.id)}
                      className="p-2 rounded-lg bg-canvas bg-surface text-muted hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      title="Generate Invoice" aria-label="Generate invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleGenerateContract(project.id)}
                      className="p-2 rounded-lg bg-canvas bg-surface text-muted hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      title="Generate Contract" aria-label="Generate contract"
                    >
                      <FileSignature className="w-4 h-4" />
                    </button>

                    {project.driveLink && (
                      <a
                        href={project.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-canvas bg-surface text-muted hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Open Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 rounded-lg bg-canvas bg-surface text-muted hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      title="Edit" aria-label="Edit project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this project?')) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Services
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                      >
                        {service.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-canvas bg-surface rounded-lg">
                  <div>
                    <p className="text-xs text-muted mb-1">Total</p>
                    <p className="text-sm font-bold text-ink">
                      {project.currency} {project.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Paid</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {project.currency} {project.paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Remaining</p>
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {project.currency} {project.remainingAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Payment Method</p>
                    <p className="text-sm font-semibold text-ink capitalize">
                      {project.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Timeline & Notes */}
                {(project.deadline || project.notes) && (
                  <div className="mt-4 pt-4 border-t border-line">
                    <div className="flex items-start gap-6 text-sm">
                      {project.deadline && (
                        <div>
                          <span className="text-muted">Deadline:</span>
                          <span className="ml-2 font-semibold text-ink">
                            {format(new Date(project.deadline), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                      {project.notes && (
                        <div className="flex-1">
                          <span className="text-muted">Notes:</span>
                          <span className="ml-2 text-ink">{project.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {isProjectModalOpen && <ProjectModal clientId={projectClientId}
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(undefined);
        }}
        project={editingProject}
      />}
      {isClientModalOpen && <ClientModal client={editingClient} onAddProject={client=>{setIsClientModalOpen(false);setEditingProject(undefined);setProjectClientId(client.id);setIsProjectModalOpen(true);}}
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />}
      {documentRequest && <DocumentStudio input={{kind:documentRequest.kind,projects:[documentRequest.project],clients}} onClose={()=>setDocumentRequest(null)} />}
    </div>
  );
};
