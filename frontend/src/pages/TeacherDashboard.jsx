import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LogOut, Calendar, Download, Save, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
    const { logout, user } = useAuth();
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);

    // Calculate stats
    const [stats, setStats] = useState({ total_students: 0, present_count: 0, absent_count: 0 });

    // Calculate stats dynamic or from state
    // If students list is loaded, calculate from it. Else use fetched stats.
    const displayTotal = students.length > 0 ? students.length : stats.total_students;
    const displayPresent = students.length > 0 ? Object.values(attendance).filter(status => status === 'Present').length : stats.present_count;
    const displayAbsent = students.length > 0 ? Object.values(attendance).filter(status => status === 'Absent').length : stats.absent_count;

    useEffect(() => {
        fetchStats();
    }, [date]); // Re-fetch stats when date changes

    const fetchStats = async () => {
        try {
            const res = await api.get('/attendance/analytics', {
                params: {
                    date: new Date(date).toISOString(),
                    branch: (branch && branch !== 'All') ? branch : undefined,
                    year: (year && year !== 'All') ? year : undefined
                }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT']; // Example branches
    const years = [1, 2, 3, 4];

    const fetchStudents = async () => {
        // Removed strict check for branch/year to allow "All"
        setLoading(true);
        try {
            let url = `/students/?`;
            const params = new URLSearchParams();

            if (year && year !== 'All') params.append('year', year);
            if (branch && branch !== 'All') params.append('branch', branch);

            url += params.toString();

            const res = await api.get(url);
            setStudents(res.data);

            // Fetch existing attendance for this date
            try {
                const attRes = await api.get('/attendance', {
                    params: {
                        date: new Date(date).toISOString(), // Ensure this matches backend expectation
                        branch: (branch && branch !== 'All') ? branch : undefined,
                        year: (year && year !== 'All') ? year : undefined
                    }
                });

                // Create map of existing attendance
                const existingAttendance = {};
                attRes.data.forEach(record => {
                    existingAttendance[record.student_roll_number] = record.status;
                });

                // Initialize attendance state (use existing or default to Present)
                const initialAttendance = {};
                res.data.forEach(s => {
                    initialAttendance[s.roll_number] = existingAttendance[s.roll_number] || 'Present';
                });
                setAttendance(initialAttendance);
            } catch (err) {
                console.error("Error fetching existing attendance", err);
                // Fallback to default present if attendance fetch fails
                const initialAttendance = {};
                res.data.forEach(s => {
                    initialAttendance[s.roll_number] = 'Present';
                });
                setAttendance(initialAttendance);
            }

        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (rollNo, status) => {
        setAttendance(prev => ({ ...prev, [rollNo]: status }));
    };

    const submitAttendance = async () => {
        if (Object.keys(attendance).length === 0) return;

        const attendanceData = Object.keys(attendance).map(rollNo => {
            // Find student to get their specific branch/year
            const student = students.find(s => s.roll_number === rollNo);
            return {
                student_roll_number: rollNo,
                status: attendance[rollNo],
                branch: student?.branch || branch, // Send specific branch
                year: student?.year || (year !== 'All' ? parseInt(year) : 0) // Send specific year
            };
        });

        try {
            await api.post('/attendance/mark', {
                date: new Date(date).toISOString(), // Or append time as discussed
                branch: branch !== 'All' ? branch : "All",
                year: year !== 'All' ? parseInt(year) : 0,
                attendance_data: attendanceData
            });
            toast.success('Attendance marked successfully!');
            toast.success('Attendance marked successfully!');
            // setStudents([]); // Kept list visible so user sees summary
            fetchStats(); // Update stats immediately
        } catch (error) {
            toast.error('Failed to mark attendance');
        }
    };

    const downloadReport = async () => {
        try {
            const params = {};
            if (date) params.date = new Date(date).toISOString(); // Send selected date
            if (year && year !== 'All') params.year = year;
            if (branch && branch !== 'All') params.branch = branch;

            const response = await api.get('/attendance/export', {
                params,
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${branch}_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Hello, {user?.name}</span>
                        <button onClick={logout} className="flex items-center text-red-600 hover:text-red-800">
                            <LogOut className="h-5 w-5 mr-1" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Controls */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Branch</label>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                            >
                                <option value="">Select Branch</option>
                                <option value="All">All Branches</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Year</label>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                <option value="">Select Year</option>
                                <option value="All">All Years</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={fetchStudents}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            >
                                Fetch Students
                            </button>
                            <button
                                onClick={downloadReport}
                                disabled={!branch || !year}
                                className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                title="Download Report"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                {/* Stats Summary - Always Visible */}
                <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-2xl font-bold text-gray-800">{displayTotal}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                            <p className="text-sm text-gray-500">Present</p>
                            <p className="text-2xl font-bold text-green-600">{displayPresent}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                            <p className="text-sm text-gray-500">Absent</p>
                            <p className="text-2xl font-bold text-red-600">{displayAbsent}</p>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                {students.length > 0 && (
                    <div className="space-y-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Mark Attendance</h3>
                                <button
                                    onClick={submitAttendance}
                                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Submit Attendance
                                </button>
                            </div>
                            <div className="border-t border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Roll Number
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Branch
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student) => (
                                            <tr key={student.roll_number}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {student.roll_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {student.branch}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex space-x-4">
                                                        <button
                                                            onClick={() => handleStatusChange(student.roll_number, 'Present')}
                                                            className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${attendance[student.roll_number] === 'Present'
                                                                ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                                                                : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                                                                }`}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.roll_number, 'Absent')}
                                                            className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${attendance[student.roll_number] === 'Absent'
                                                                ? 'bg-red-100 text-red-800 ring-2 ring-red-600'
                                                                : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                                                                }`}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            Absent
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;
