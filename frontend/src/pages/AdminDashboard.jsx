import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Upload, Users, BarChart, LogOut, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics');
    const [stats, setStats] = useState({ total_students: 0, present_count: 0, absent_count: 0 });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Teacher creation state
    const [newTeacher, setNewTeacher] = useState({ username: '', email: '', password: '', full_name: '' });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/attendance/analytics');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post('/students/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Students uploaded successfully');
            setFile(null);
            fetchStats();
        } catch (error) {
            const message = error.response?.data?.detail || 'Upload failed';
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { ...newTeacher, role: 'teacher' });
            toast.success('Teacher created successfully');
            setNewTeacher({ username: '', email: '', password: '', full_name: '' });
        } catch (error) {
            toast.error('Failed to create teacher');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {user?.name}</span>
                        <button onClick={logout} className="flex items-center text-red-600 hover:text-red-800">
                            <LogOut className="h-5 w-5 mr-1" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Tabs */}
                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <BarChart className="h-5 w-5 mr-2" /> Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Upload className="h-5 w-5 mr-2" /> Upload Students
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`flex items-center px-4 py-2 rounded-md ${activeTab === 'teachers' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Users className="h-5 w-5 mr-2" /> Manage Teachers
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    {activeTab === 'analytics' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-medium text-blue-800">Total Students</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_students}</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                                <h3 className="text-lg font-medium text-green-800">Present Today</h3>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.present_count}</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                                <h3 className="text-lg font-medium text-red-800">Absent Today</h3>
                                <p className="text-3xl font-bold text-red-600 mt-2">{stats.absent_count}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="max-w-xl mx-auto">
                            <h3 className="text-lg font-medium mb-4">Upload Student Data (Excel)</h3>
                            <form onSubmit={handleFileUpload} className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Supported formats: .xlsx, .xls</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!file || uploading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Data'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="max-w-xl mx-auto">
                            <h3 className="text-lg font-medium mb-4">Create New Teacher Account</h3>
                            <form onSubmit={handleCreateTeacher} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={newTeacher.full_name}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={newTeacher.email}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={newTeacher.username}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={newTeacher.password}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                >
                                    Create Teacher
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
