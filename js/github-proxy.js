// js/github-proxy.js
class GitHubProxy {
    constructor() {
        this.GITHUB_TOKEN = null;
        this.REPO_OWNER = 'ederramossupervisor';
        this.REPO_NAME = 'sistema-supervisao';
    }

    // Obter token do GitHub (precisaremos criar)
    async getGitHubToken() {
        if (this.GITHUB_TOKEN) return this.GITHUB_TOKEN;
        
        // Em produção, isso viria de uma configuração segura
        // Por enquanto, vamos usar um token temporário
        throw new Error('GitHub token não configurado. Veja as instruções no README.');
    }

    // Enviar requisição para GitHub Actions
    async sendRequest(requestData) {
        try {
            console.log('🚀 Disparando GitHub Actions...', requestData.documentType);
            
            const token = await this.getGitHubToken();
            
            const response = await fetch(`https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/dispatches`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: 'apps-script-request',
                    client_payload: requestData
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
            }

            console.log('✅ GitHub Actions disparado com sucesso');
            
            // Como o GitHub Actions é assíncrono, retornamos sucesso
            // e assumimos que o Apps Script processará em background
            return {
                success: true,
                message: 'Documento em processamento via GitHub Actions',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Erro no GitHub Proxy:', error);
            throw error;
        }
    }
}

// Instância global
const githubProxy = new GitHubProxy();
