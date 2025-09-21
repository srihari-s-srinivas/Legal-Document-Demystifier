import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { DocumentView } from './components/DocumentView';
import { ComparisonView } from './components/ComparisonView';
import { BilingualView } from './components/BilingualView';
import { RemindersView } from './components/RemindersView';
import { simplifyDocument, compareDocuments, getContractAnalysis } from './services/geminiService';
import type { User, AnalyzedDocument, SimplifiedAnalysis, ComparisonResult, DocumentStatus, ContractAnalysisResult } from './types';

// Mock user data for demonstration, now with more details
const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john.doe@example.com',
    contactNumber: '123-456-7890',
    address: { city: 'San Francisco', state: 'CA', country: 'USA' },
    dob: '1990-01-01',
    gender: 'male',
    occupation: 'Software Engineer',
    profilePictureUrl: ''
  },
];

type Page = 'login' | 'signup' | 'app' | 'profile';
type AppView = 'dashboard' | 'document' | 'comparison' | 'bilingual' | 'reminders';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [appView, setAppView] = useState<AppView>('dashboard');

  const [documents, setDocuments] = useState<AnalyzedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<AnalyzedDocument | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [documentsForComparison, setDocumentsForComparison] = useState<AnalyzedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for logged-in user in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentPage('app');
    }
  }, []);

  const handleLogin = (email: string, pass: string) => {
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setCurrentPage('app');
      setAppView('dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleSignup = (name: string, email: string, pass: string) => {
    const newUser: User = { 
        id: String(MOCK_USERS.length + 1), 
        name, 
        email,
        // Initialize new profile fields as empty
        contactNumber: '',
        address: { city: '', state: '', country: '' },
        dob: '',
        gender: 'prefer_not_to_say',
        occupation: '',
        profilePictureUrl: ''
    };
    MOCK_USERS.push(newUser);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentPage('app');
    setAppView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setDocuments([]);
    setCurrentPage('login');
  };
  
  const handleUpdateProfile = (updatedUser: User) => {
    const userIndex = MOCK_USERS.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
    }
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Profile updated successfully!');
    setCurrentPage('app');
    setAppView('dashboard');
  };

  const handleAddFiles = (newFiles: { fileName: string, content: string }[]) => {
    const newDocuments: AnalyzedDocument[] = newFiles.map(file => ({
        id: `${file.fileName}-${Date.now()}`,
        fileName: file.fileName,
        originalContent: file.content,
        analysis: null,
        status: 'pending',
        contractAnalysis: null,
        contractAnalysisStatus: 'none',
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleAnalyzeDocuments = async (docIds: string[]) => {
    setDocuments(prev => prev.map(doc => docIds.includes(doc.id) ? { ...doc, status: 'analyzing' } : doc));
    
    const analysesPromises = documents
        .filter(doc => docIds.includes(doc.id))
        .map(doc => simplifyDocument(doc.originalContent).then(analysis => ({ id: doc.id, analysis })));
    
    try {
        const results = await Promise.all(analysesPromises);
        setDocuments(prev => prev.map(doc => {
            const result = results.find(r => r.id === doc.id);
            if (result) {
                return { ...doc, analysis: result.analysis, status: 'complete' };
            }
            return doc;
        }));
    } catch (err) {
        console.error("Analysis failed:", err);
        setError("One or more documents failed to be analyzed.");
        setDocuments(prev => prev.map(doc => docIds.includes(doc.id) ? { ...doc, status: 'error' } : doc));
    }
  };

  const handleViewDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        setSelectedDocument(doc);
        setAppView('document');
    }
  };
  
  const handleNavigateToBilingualView = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        setSelectedDocument(doc);
        setAppView('bilingual');
    }
  };

  const handleAnalyzeForReminders = async (docId: string) => {
      setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, contractAnalysisStatus: 'pending' } : doc));
      
      try {
          const docToAnalyze = documents.find(d => d.id === docId);
          if (!docToAnalyze) throw new Error("Document not found");

          const result = await getContractAnalysis(docToAnalyze.originalContent);
          
          setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, contractAnalysis: result, contractAnalysisStatus: 'complete' } : doc));
          
          // Automatically navigate to the reminders view after analysis
          setSelectedDocument(documents.find(d => d.id === docId) || null);
          setAppView('reminders');

      } catch (err) {
          console.error("Contract analysis failed:", err);
          setError("The contract analysis could not be completed.");
          setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, contractAnalysisStatus: 'error' } : doc));
      }
  };

  const handleViewReminders = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc && doc.contractAnalysis) {
        setSelectedDocument(doc);
        setAppView('reminders');
    }
  };

  const handleCompareDocuments = async (docsToCompare: AnalyzedDocument[]) => {
    setIsLoading(true);
    setError(null);
    setDocumentsForComparison(docsToCompare);
    setAppView('comparison');

    try {
        const result = await compareDocuments(docsToCompare);
        setComparisonResult(result);
    } catch (err) {
        console.error("Comparison failed:", err);
        setError("The comparison could not be completed.");
        setComparisonResult(null); // Clear previous results on error
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleBackToDashboard = () => {
    setSelectedDocument(null);
    setComparisonResult(null);
    setDocumentsForComparison([]);
    setAppView('dashboard');
  }

  const renderApp = () => {
    switch (appView) {
        case 'dashboard':
            return (
                <Dashboard 
                    documents={documents}
                    onAddFiles={handleAddFiles}
                    onAnalyze={handleAnalyzeDocuments}
                    onView={handleViewDocument}
                    onCompare={handleCompareDocuments}
                    onTranslate={handleNavigateToBilingualView}
                    onAnalyzeForReminders={handleAnalyzeForReminders}
                    onViewReminders={handleViewReminders}
                />
            );
        case 'document':
            if (selectedDocument?.analysis) {
                return (
                    <DocumentView
                      fileName={selectedDocument.fileName}
                      originalContent={selectedDocument.originalContent}
                      analysis={selectedDocument.analysis}
                      onReset={handleBackToDashboard}
                    />
                );
            }
            handleBackToDashboard(); // Fallback
            return null;
        case 'comparison':
            return (
                <ComparisonView 
                    documents={documentsForComparison}
                    result={comparisonResult}
                    isLoading={isLoading}
                    error={error}
                    onBack={handleBackToDashboard}
                />
            );
        case 'bilingual':
            if (selectedDocument) {
                return (
                    <BilingualView
                      document={selectedDocument}
                      onBack={handleBackToDashboard}
                    />
                );
            }
            handleBackToDashboard(); // Fallback
            return null;
        case 'reminders':
            if (selectedDocument?.contractAnalysis) {
                return (
                    <RemindersView
                        document={selectedDocument}
                        analysis={selectedDocument.contractAnalysis}
                        onBack={handleBackToDashboard}
                    />
                );
            }
            handleBackToDashboard(); // Fallback
            return null;
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigateToSignup={() => setCurrentPage('signup')} />;
      case 'signup':
        return <SignupPage onSignup={handleSignup} onNavigateToLogin={() => setCurrentPage('login')} />;
      case 'app':
        return renderApp();
      case 'profile':
        if (user) {
          return <ProfilePage user={user} onUpdateProfile={handleUpdateProfile} onCancel={() => {setCurrentPage('app'); setAppView('dashboard');}} />;
        }
        // If no user, redirect to login
        setCurrentPage('login');
        return null;
      default:
        return <LoginPage onLogin={handleLogin} onNavigateToSignup={() => setCurrentPage('signup')} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
      <Header 
        user={user} 
        onLogout={handleLogout}
        onNavigateToDashboard={() => {setCurrentPage('app'); handleBackToDashboard();}}
        onNavigateToProfile={() => setCurrentPage('profile')}
      />
      <main className="flex-grow w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
