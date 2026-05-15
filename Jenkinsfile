pipeline {
    agent any

    environment {
        DOCKERHUB = "laziesv"

        BACKEND_IMAGE = "${DOCKERHUB}/go-backend:latest"
        FRONTEND_IMAGE = "${DOCKERHUB}/nextjs-frontend:latest"

        K8S_NAMESPACE = "todo-app"

        // ✅ FIX: frontend must know backend URL at build time
        NEXT_PUBLIC_API_URL = "http://app.10.0.2.15.nip.io"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'todo-app',
                    url: 'https://github.com/laziesv/ServerlessProject.git'
            }
        }

        stage('Build Backend') {
            steps {
                sh """
                    docker build -t $BACKEND_IMAGE ./backend
                """
            }
        }

        stage('Build Frontend') {
            steps {
                sh """
                    docker build \
                      -t $FRONTEND_IMAGE \
                      --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
                      ./frontend
                """
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh """
                        echo $PASS | docker login -u $USER --password-stdin
                    """
                }
            }
        }

        stage('Push Images') {
            steps {
                sh """
                    docker push $BACKEND_IMAGE
                    docker push $FRONTEND_IMAGE
                """
            }
        }

        stage('Deploy to K8s') {
            steps {
                sh """
                    kubectl apply -f k8s/

                    kubectl rollout restart deployment go-backend -n $K8S_NAMESPACE
                    kubectl rollout restart deployment next-frontend -n $K8S_NAMESPACE
                """
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Success!"
        }

        failure {
            echo "❌ Deployment Failed!"
        }
    }
}