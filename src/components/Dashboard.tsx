import { useState } from 'react';
import { useStore } from '../store/useStore';
import {

  DollarSign,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const { projects: allProjects, clients, timeEntries, activeTimeEntry } = useStore();
  const [currency,setCurrency] = useState('EGP');
  const projects = allProjects.filter(p => p.currency === currency);

  // Calculate metrics
  const totalRevenue = projects.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = projects.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalOutstanding = projects.reduce((sum, p) => sum + p.remainingAmount, 0);

  const activeProjects = projects.filter(p => p.projectStatus === 'active');
  const completedProjects = projects.filter(p => p.projectStatus === 'completed');

  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = projects
    .filter(p => p.deadline && isAfter(new Date(p.deadline), new Date()) && isBefore(new Date(p.deadline), addDays(new Date(), 7)))
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  // Overdue projects
  const overdueProjects = projects.filter(p => p.deadline && isBefore(new Date(p.deadline), new Date()) && p.projectStatus === 'active');

  // Payment status breakdown
  const paymentStatusData = [
    { name: 'Paid', value: projects.filter(p => p.paymentStatus === 'paid').length, color: '#059669' },
    { name: 'Partial', value: projects.filter(p => p.paymentStatus === 'partial').length, color: '#f59e0b' },
    { name: 'Pending', value: projects.filter(p => p.paymentStatus === 'pending').length, color: '#0b58bd' },
    { name: 'Overdue', value: projects.filter(p => p.paymentStatus === 'overdue').length, color: '#dc2626' },
  ];

  // Monthly revenue (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - i));
    const monthProjects = projects.filter(p => {
      const startDate = new Date(p.contractStartDate);
      return startDate.getMonth() === date.getMonth() && startDate.getFullYear() === date.getFullYear();
    });

    return {
      month: format(date, 'MMM'),
      revenue: monthProjects.reduce((sum, p) => sum + p.paidAmount, 0),
    };
  });

  // Time tracking stats
  const totalHoursThisMonth = timeEntries
    .filter(e => !e.isActive && e.endTime)
    .filter(e => {
      const entryDate = new Date(e.startTime);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + (e.duration || 0), 0) / (1000 * 60 * 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Contract values and recorded payments · grouped by project start month
        </p>
      </div>

      <label>Currency <select aria-label="Dashboard currency" value={currency} onChange={e => setCurrency(e.target.value)}>{['EGP','USD','EUR','GBP'].map(c => <option key={c}>{c}</option>)}</select></label>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Contract value"
          value={`${currency} ${totalRevenue.toLocaleString()}`}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Collected"
          value={`${currency} ${totalPaid.toLocaleString()}`}
          subtitle={`${(totalRevenue ? (totalPaid / totalRevenue) * 100 : 0).toFixed(0)}% collected`}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Outstanding"
          value={`${currency} ${totalOutstanding.toLocaleString()}`}
          subtitle={`${projects.filter(p => p.remainingAmount > 0).length} invoices`}
          color="amber"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Active Projects"
          value={activeProjects.length.toString()}
          subtitle={`${clients.length} clients`}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-surface rounded-lg border border-line p-6">
          <h3 className="text-base font-bold text-ink mb-4">Payments by project start month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-line)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-ink)',
                  border: '1px solid var(--border-line)',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Pie */}
        <div className="bg-surface rounded-lg border border-line p-6">
          <h3 className="text-base font-bold text-ink mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentStatusData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Deadlines & Time Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-surface rounded-lg border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink">Upcoming Deadlines</h3>
            <Calendar className="w-5 h-5 text-muted" />
          </div>

          {overdueProjects.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                ⚠️ {overdueProjects.length} overdue project{overdueProjects.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted">No upcoming deadlines</p>
            ) : (
              upcomingDeadlines.map(project => {
                const client = clients.find(c => c.id === project.clientId);
                return (
                  <div key={project.id} className="flex items-start justify-between p-3 bg-canvas bg-surface rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{client?.businessName}</p>
                      <p className="text-xs text-muted mt-0.5">{project.refId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-primary">{format(new Date(project.deadline!), 'MMM dd')}</p>
                      <p className="text-xs text-muted">{format(new Date(project.deadline!), 'yyyy')}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Time Tracking Summary */}
        <div className="bg-surface rounded-lg border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink">Time Tracking</h3>
            <Clock className="w-5 h-5 text-muted" />
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">This Month</p>
              <p className="text-3xl font-bold text-ink">{totalHoursThisMonth.toFixed(1)}</p>
              <p className="text-sm text-muted">hours tracked</p>
            </div>

            {activeTimeEntry && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-200">Timer Active</p>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Started {format(new Date(activeTimeEntry.startTime), 'HH:mm')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-canvas bg-surface rounded-lg">
                <p className="text-xs text-muted mb-1">Total Entries</p>
                <p className="text-xl font-bold text-ink">{timeEntries.length}</p>
              </div>
              <div className="p-3 bg-canvas bg-surface rounded-lg">
                <p className="text-xs text-muted mb-1">Avg per Day</p>
                <p className="text-xl font-bold text-ink">
                  {(totalHoursThisMonth / 30).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat label="Total Clients" value={clients.length} icon={<Users className="w-4 h-4" />} />
        <QuickStat label="Active Projects" value={activeProjects.length} icon={<Activity className="w-4 h-4" />} />
        <QuickStat label="Completed" value={completedProjects.length} icon={<CheckCircle2 className="w-4 h-4" />} />
        <QuickStat label="Overdue" value={overdueProjects.length} icon={<AlertCircle className="w-4 h-4" />} />
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({
  icon,
  label,
  value,
  subtitle,
  trend,
  trendUp,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'amber' | 'purple';
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]} text-ink`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-ink mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted">{subtitle}</p>
      )}
    </div>
  );
};

const QuickStat = ({
  label,
  value,
  icon
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <div className="bg-canvas bg-surface rounded-lg p-4 border border-line">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-muted">{icon}</div>
      <p className="text-xs font-semibold text-muted">{label}</p>
    </div>
    <p className="text-2xl font-bold text-ink">{value}</p>
  </div>
);
