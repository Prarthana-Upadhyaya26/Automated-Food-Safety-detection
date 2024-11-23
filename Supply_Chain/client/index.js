import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import configuration from '../build/contracts/chain.json';

const CONTRACT_ADDRESS = configuration.networks['5777'].address; // Replace '5777' with your Ganache network ID if different
const CONTRACT_ABI = configuration.abi;

let web3;
let contract;
let account;

const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            account = accounts[0];
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            
            document.getElementById('status').textContent = 'Connected to MetaMask';
            document.getElementById('account').textContent = `Connected Account: ${account}`;
            document.getElementById('connectWallet').textContent = 'Connected';
            document.getElementById('connectWallet').classList.add('bg-green-500');
        } catch (error) {
            console.error('Failed to connect to MetaMask:', error);
            document.getElementById('status').textContent = 'Failed to connect to MetaMask';
        }
    } else {
        document.getElementById('status').textContent = 'MetaMask not detected';
    }
};

document.getElementById('connectWallet').addEventListener('click', connectWallet);

const handleAction = async (action, ...args) => {
    if (!contract || !account) {
        Swal.fire('Error', 'Please connect your wallet first', 'error');
        return;
    }

    try {
        await contract.methods[action](...args).send({ from: account });
        Swal.fire('Success', `${action} successful`, 'success');
    } catch (error) {
        console.error(`${action} failed:`, error);
        Swal.fire('Error', `${action} failed: ${error.message}`, 'error');
    }
};

document.getElementById('addParticipantForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('role').value;
    const address = document.getElementById('participantAddress').value;
    await handleAction('addParticipant', address, parseInt(role));
});

document.getElementById('addColdDrinkForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;

    // Open the camera for scanning ingredients
    const videoElement = document.createElement('video');
    videoElement.setAttribute('autoplay', true);
    videoElement.setAttribute('playsinline', true);
    document.body.appendChild(videoElement);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    Swal.fire({
        title: 'Scan Ingredients',
        text: 'Point the camera at the ingredients list and click "Capture" when ready.',
        html: videoElement,
        showCancelButton: true,
        confirmButtonText: 'Capture',
        preConfirm: () => {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoElement, 0, 0);
                const imageData = canvas.toDataURL('image/png');
                resolve(imageData);
            });
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const imageData = result.value;

            // Send image to backend for processing
            const response = await fetch('http://127.0.0.1:5000/process-ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData })
            });

            const data = await response.json();
            const ingredientsPermitted = data.status === 'Permitted';

            await handleAction('addColdDrink', name, description, ingredientsPermitted);

            Swal.fire(
                ingredientsPermitted ? 'Ingredients Permitted' : 'Ingredients Not Permitted',
                `Ingredients processed. Status: ${data.status}`,
                ingredientsPermitted ? 'success' : 'error'
            );
        }

        // Stop the camera stream
        stream.getTracks().forEach((track) => track.stop());
        document.body.removeChild(videoElement);
    });
});


['supplyRawMaterials', 'manufactureColdDrink', 'distributeColdDrink', 'retailColdDrink', 'sellColdDrink'].forEach(action => {
    document.getElementById(action).addEventListener('click', async () => {
        const id = await Swal.fire({
            title: 'Enter Cold Drink ID',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (id) => {
                if (!id) {
                    Swal.showValidationMessage('Please enter a valid ID')
                }
                return id;
            }
        });

        if (id.isConfirmed) {
            await handleAction(action, parseInt(id.value));
        }
    });
});

window.addEventListener('load', () => {
    document.getElementById('status').textContent = 'Please connect your wallet';
});