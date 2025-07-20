'use client'

import { useState, useEffect } from 'react'

export function ClientAnalytics({ clients }) {
  const [analytics, setAnalytics] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    totalUsers: 0,
    averageUsersPerClient: 0,
    topDomains: [],
    recentActivity: [],
    growthRate: 0,
    clientSatisfaction: 0
  })

  useEffect(() => {
    if (clients && clients.length > 0) {
      calculateAnalytics()
    }
  }, [clients])

  const calculateAnalytics = () => {
    const totalClients = clients.length
    const activeClients = clients.filter(c => c.is_active).length
    const inactiveClients = totalClients - activeClients
    
    // Calculate domain statistics
    const domainCounts = {}
    clients.forEach(client => {
      if (client.primary_email_domain) {
        domainCounts[client.primary_email_domain] = (domainCounts[client.primary_email_domain] || 0) + 1
      }
    })
    
    const topDomains = Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }))
    
    // Calculate growth rate (mock data for now)
    const growthRate = ((activeClients / Math.max(totalClients - 5, 1)) - 1) * 100
    
    // Mock client satisfaction score
    const clientSatisfaction = Math.floor(Math.random() * 20) + 80 // 80-100 range
    
    // Mock recent activity
    const recentActivity = clients.slice(0, 3).map(client => ({
      id: client.id,
      name: client.name,
      action: Math.random() > 0.5 ? 'User Login' : 'Query Submitted',
      time: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString()
    }))
    
    setAnalytics({
      totalClients,
      activeClients,
      inactiveClients,
      totalUsers: totalClients * Math.floor(Math.random() * 50) + 10, // Mock user count
      averageUsersPerClient: Math.floor((totalClients * Math.floor(Math.random() * 50) + 10) / totalClients),
      topDomains,
      recentActivity,
      growthRate: Math.round(growthRate * 100) / 100,
      clientSatisfaction
    })
  }

  const getGrowthColor = (rate) => {
    if (rate > 0) return 'text-green-600'
    if (rate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (rate) => {
    if (rate > 0) return '↗'
    if (rate < 0) return '↘'
    return '→'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalClients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.activeClients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Growth Rate</p>
              <p className={`text-2xl font-semibold ${getGrowthColor(analytics.growthRate)}`}>
                {getGrowthIcon(analytics.growthRate)} {analytics.growthRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Domains */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Email Domains</h3>
          <div className="space-y-3">
            {analytics.topDomains.map((domain, index) => (
              <div key={domain.domain} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                  <span className="text-sm text-gray-900 ml-2">{domain.domain}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(domain.count / analytics.totalClients) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{domain.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Satisfaction & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Satisfaction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Client Satisfaction</h3>
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - analytics.clientSatisfaction / 100)}`}
                  className="text-green-500"
                />
              </svg>
              <div className="absolute">
                <span className="text-2xl font-bold text-gray-900">{analytics.clientSatisfaction}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Overall satisfaction score</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Active Rate</span>
                <span className="text-gray-900">{Math.round((analytics.activeClients / analytics.totalClients) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(analytics.activeClients / analytics.totalClients) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg Users/Client</span>
                <span className="text-gray-900">{analytics.averageUsersPerClient}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((analytics.averageUsersPerClient / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">System Uptime</span>
                <span className="text-gray-900">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 