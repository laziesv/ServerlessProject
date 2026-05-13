pipeline {
  agent any

  environment {
    APP_DIR = 'frontend'
    DOCKER_IMAGE = 'kiadt/todo-list'
    DOCKER_TAG = "${env.BUILD_NUMBER}"
    KUBE_NAMESPACE = 'todo-list'
  }

  triggers {
    githubPush()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        dir(env.APP_DIR) {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Test') {
      steps {
        dir(env.APP_DIR) {
          sh 'npm run lint'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ./frontend'
      }
    }

    stage('Push to Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
          sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG}'
          sh 'docker push ${DOCKER_IMAGE}:latest'
        }
      }
    }

    stage('Deploy') {
      steps {
        dir('terraform') {
          sh 'terraform init'
          sh 'terraform apply -auto-approve -var="namespace=${KUBE_NAMESPACE}"'
        }
        dir('ansible') {
          sh 'ansible-playbook -i inventory playbook.yml'
        }
        sh 'kubectl apply -f k8s/deployment.yaml'
        sh 'kubectl apply -f k8s/service.yaml'
        sh 'kubectl set image -n ${KUBE_NAMESPACE} deployment/todo-list todo-list=${DOCKER_IMAGE}:${DOCKER_TAG}'
        sh 'kubectl rollout status -n ${KUBE_NAMESPACE} deployment/todo-list'
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}
