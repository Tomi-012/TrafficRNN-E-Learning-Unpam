import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-red-500/10 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            Oops! Terjadi Kesalahan
                        </h1>

                        <p className="text-slate-400 mb-6">
                            Aplikasi mengalami error yang tidak terduga. Jangan khawatir, data Anda aman.
                        </p>

                        {this.state.error && (
                            <div className="mb-6 p-4 bg-slate-950/50 rounded-lg border border-slate-700">
                                <p className="text-xs text-red-400 font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Muat Ulang Aplikasi
                        </button>

                        <p className="mt-4 text-xs text-slate-500">
                            Jika masalah terus berlanjut, silakan hubungi tim pengembang.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
