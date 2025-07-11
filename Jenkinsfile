pipeline{

  agent any
  environment {
    version = '1.0'
  }

  tools {
    nodejs "NodeJS24" // Reference the NodeJS installation
  }

  stages{

    stage('Build'){
      steps{
          dir('my-app') { 
              sh 'npm install'
              sh 'npm run build'
          }
      }
    }

    stage('Deploy'){
      steps{
        sh "cp -rf my-app/dist/* /home/student/zeli/frontend/"
      }
    }
  }
}
