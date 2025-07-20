import React from 'react';
import { BarChart3, TrendingUp, Users, FileText, AlertCircle, CheckCircle, Calendar, Clock, Target, Award, Building, MapPin, PieChart, Activity } from 'lucide-react';

interface DashboardProps {
  onNavigate?: (path: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const stats = [
    {
      title: 'Total Enterprises',
      value: '12,456',
      change: '+12%',
      trend: 'up',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      description: 'Registered enterprises'
    },
    {
      title: 'Completed Surveys',
      value: '8,945',
      change: '+8%',
      trend: 'up',
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      description: 'Successfully completed'
    },
    {
      title: 'Pending Surveys',
      value: '2,341',
      change: '-5%',
      trend: 'down',
      icon: <AlertCircle className="h-8 w-8 text-yellow-600" />,
      description: 'Awaiting completion'
    },
    {
      title: 'Frames Uploaded',
      value: '156',
      change: '+3%',
      trend: 'up',
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      description: 'This month'
    }
  ];

  const additionalStats = [
    {
      title: 'Response Rate',
      value: '87.2%',
      change: '+2.1%',
      trend: 'up',
      icon: <Target className="h-6 w-6 text-indigo-600" />,
      color: 'indigo'
    },
    {
      title: 'Avg. Completion Time',
      value: '4.2 days',
      change: '-0.8 days',
      trend: 'up',
      icon: <Clock className="h-6 w-6 text-emerald-600" />,
      color: 'emerald'
    },
    {
      title: 'Quality Score',
      value: '94.5%',
      change: '+1.2%',
      trend: 'up',
      icon: <Award className="h-6 w-6 text-amber-600" />,
      color: 'amber'
    },
    {
      title: 'Active Users',
      value: '342',
      change: '+15',
      trend: 'up',
      icon: <Activity className="h-6 w-6 text-rose-600" />,
      color: 'rose'
    }
  ];

  const sectorDistribution = [
    { name: 'Manufacturing', value: 35, count: 4359, color: 'bg-blue-500' },
    { name: 'Services', value: 28, count: 3488, color: 'bg-green-500' },
    { name: 'Construction', value: 18, count: 2242, color: 'bg-yellow-500' },
    { name: 'Trade', value: 12, count: 1495, color: 'bg-purple-500' },
    { name: 'Transport', value: 7, count: 872, color: 'bg-pink-500' }
  ];

  const monthlyTrends = [
    { month: 'Jan', surveys: 1200, completed: 980, target: 1100 },
    { month: 'Feb', surveys: 1350, completed: 1180, target: 1200 },
    { month: 'Mar', surveys: 1180, completed: 1050, target: 1150 },
    { month: 'Apr', surveys: 1420, completed: 1280, target: 1300 },
    { month: 'May', surveys: 1580, completed: 1420, target: 1400 },
    { month: 'Jun', surveys: 1650, completed: 1580, target: 1500 }
  ];

  const regionalData = [
    { region: 'North', surveys: 2845, completion: 89, color: 'bg-blue-500' },
    { region: 'South', surveys: 3120, completion: 92, color: 'bg-green-500' },
    { region: 'East', surveys: 2156, completion: 85, color: 'bg-yellow-500' },
    { region: 'West', surveys: 2890, completion: 88, color: 'bg-purple-500' },
    { region: 'Central', surveys: 1445, completion: 83, color: 'bg-pink-500' }
  ];

  const recentActivity = [
    { id: 1, action: 'Frame uploaded', user: 'Admin User', time: '2 hours ago', type: 'upload' },
    { id: 2, action: 'Survey completed', user: 'Enterprise ABC', time: '4 hours ago', type: 'survey' },
    { id: 3, action: 'Notice generated', user: 'RO User', time: '6 hours ago', type: 'notice' },
    { id: 4, action: 'Frame allocated', user: 'CPG User', time: '1 day ago', type: 'allocation' },
    { id: 5, action: 'Scrutiny completed', user: 'DS User', time: '1 day ago', type: 'scrutiny' },
    { id: 6, action: 'Report generated', user: 'RO User', time: '2 days ago', type: 'report' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {additionalStats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Survey Progress Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Survey Progress by Sector</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Manufacturing</span>
              <span className="text-sm font-medium text-gray-900">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Services</span>
              <span className="text-sm font-medium text-gray-900">72%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Construction</span>
              <span className="text-sm font-medium text-gray-900">64%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sector Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {sectorDistribution.map((sector, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${sector.color}`}></div>
                  <span className="text-sm text-gray-700">{sector.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{sector.value}%</div>
                  <div className="text-xs text-gray-500">{sector.count.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'upload' ? 'bg-blue-500' :
                  activity.type === 'survey' ? 'bg-green-500' :
                  activity.type === 'notice' ? 'bg-purple-500' :
                  activity.type === 'allocation' ? 'bg-yellow-500' :
                  activity.type === 'scrutiny' ? 'bg-orange-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Survey Trends</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {monthlyTrends.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-900">{month.completed}/{month.surveys}</span>
                    <span className="text-xs text-gray-500 ml-2">Target: {month.target}</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(month.completed / month.surveys) * 100}%` }}
                    ></div>
                  </div>
                  <div 
                    className="absolute top-0 h-2 w-1 bg-red-400 rounded-full"
                    style={{ left: `${(month.target / month.surveys) * 100}%` }}
                    title="Target"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {regionalData.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${region.color}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{region.region}</p>
                    <p className="text-xs text-gray-500">{region.surveys.toLocaleString()} surveys</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{region.completion}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className={`h-1 rounded-full ${region.color}`}
                      style={{ width: `${region.completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="87.2, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">87%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Overall Completion</p>
          </div>
          
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="94.5, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">95%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Quality Score</p>
          </div>
          
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="78, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">78%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">On-Time Delivery</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onNavigate && onNavigate('/frame-upload')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Upload Frame</span>
            </div>
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('/frame-allocation')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium text-green-900">Allocate Frame</span>
            </div>
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('/reports')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Generate Report</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;