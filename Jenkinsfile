pipeline{

  agent any
  environment {
    version = '1.0'
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
