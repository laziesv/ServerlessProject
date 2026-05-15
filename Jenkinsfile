pipeline {
    agent any

    environment {
        DOCKERHUB = "laziesv"

        BACKEND_IMAGE = "${DOCKERHUB}/go-backend:latest"
        FRONTEND_IMAGE = "${DOCKERHUB}/nextjs-frontend:latest"

        K8S_NAMESPACE = "todo-app"
    }

    stages {

        # =========================
        # 1. Checkout Code
        # =========================
        stage('Checkout') {
            steps {
                git branch: 'todo-app',
                    url: 'https://github.com/laziesv/ServerlessProject.git'
            }
        }

        # =========================
        # 2. Build Backend (Go)
        # =========================
        stage('Build Backend') {
            steps {
                sh '''
                    docker build -t $BACKEND_IMAGE ./backend
                '''
            }
        }

        # =========================
        # 3. Build Frontend (Next.js)
        # =========================
        stage('Build Frontend') {
            steps {
                sh '''
                    docker build -t $FRONTEND_IMAGE ./frontend
                '''
            }
        }

        # =========================
        # 4. Login DockerHub
        # =========================
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                        echo $PASS | docker login -u $USER --password-stdin
                    '''
                }
            }
        }

        # =========================
        # 5. Push Images
        # =========================
        stage('Push Images') {
            steps {
                sh '''
                    docker push $BACKEND_IMAGE
                    docker push $FRONTEND_IMAGE
                '''
            }
        }

        # =========================
        # 6. Deploy to Kubernetes
        # =========================
        stage('Deploy to K8s') {
            steps {
                sh '''
                    kubectl apply -f k8s/
                    kubectl rollout restart deployment go-backend -n $K8S_NAMESPACE
                    kubectl rollout restart deployment next-frontend -n $K8S_NAMESPACE
                '''
            }
        }
    }

    # =========================
    # POST ACTIONS
    # =========================
    post {
        success {
            echo '✅ Deployment Success!'
        }

        failure {
            echo '❌ Deployment Failed!'
        }
    }
}