#### 1. SSH into the VPS using the root user

ssh root@80.32.22.19

#### 2. Update the package list to ensure you have the latest information

sudo apt update -y

#### 3. Install necessary packages for Docker installation (transport, certificates, curl, etc.)

sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

#### 4. Add the Docker GPG key to verify the authenticity of the Docker package

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

#### 5. Add the Docker repository to the sources list to install Docker from

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu focal stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

#### 6. Update the package list again after adding the Docker repository

sudo apt update -y

#### 7. Install Docker from the newly added Docker repository

sudo apt install -y docker-ce

#### 8. Start Docker service and enable it to start on boot

sudo systemctl start docker
sudo systemctl enable docker

#### 9. Check the Docker version to ensure it's installed correctly

docker --version

#### 10. Install Docker Compose by fetching the binary from GitHub

sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

#### 11. Make the Docker Compose binary executable

sudo chmod +x /usr/local/bin/docker-compose

#### 12. check the installed version of docker compose

docker-compose --version

#### 13. Create the directory where you want to store your project.
####     For example, create a directory inside /home/root/ called 'projects'

sudo mkdir -p /home/root/projects

#### 14. Clone your GitHub repository using SSH (replace <token> and the repository path with your actual values)

git clone https://<token>@github.com/your-username/your-repo.git

#### 15. Open Visual Studio Code via remote SSH. Add your password if prompted to connect to the VPS.

#### 16. In VS Code, press 'Ctrl + Shift + P' and navigate to `/home/root/projects/node-micro-practice`.

#### 17. Open the folder `/home/root/projects/node-micro-practice` in VS Code.

#### 18. Add environment variables for each service inside the VPS in your VS Code project.

#### 19. Manually copy your SSH public key to the VPS by generating a new SSH key pair:

ssh-keygen -t rsa -b 4096 -C "sangamukherjee2022@example.com"

#### 20. View the content of your SSH private key (path provided for Windows example):

Get-Content C:\Users\sanga\.ssh\id_rsa

#### 21. Open a terminal on your VPS and login:

ssh root@80.32.22.19

#### 22. Navigate to the SSH directory and list its contents

ls -ld ~/.ssh

#### 23. Set correct permissions for the SSH directory (700 ensures it's secure)

chmod 700 ~/.ssh

#### 24. Add your public key to the authorized_keys file for SSH access
####     Ensure you add the public key content inside ~/.ssh/authorized_keys

chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
