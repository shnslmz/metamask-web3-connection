$( document ).ready(function()
{
    // Set the variables
    const btnConnect    		= $('#btnConnectMetaMask');
    const btnDisconnect 		= $('#btnDisconnectMetaMask');
    const DvAddressInfo        	= $('#DvAddressInfo');
    const userWalletAddress 	= null;
    const walletBalance 	    = null;
    const isConnected 			= false; // disconnect request was sent or not
    const checkSecureProtocol   = false; // http or https



    /*
     * Step zero: If secure protocol checking is enabled,
     * Check the protocol
     */

    if(checkSecureProtocol === true)
    {
        if(location.protocol !== 'https:')
        {
            alert('Your connection is NOT secure, use https.');
            return false;
        }
    }



    /*
     * Firstly, check MetaMask is installed?
     */
    if (typeof window.ethereum === 'undefined')
    {
        console.log('MetaMask is NOT installed!');
        alert("MetaMask is not installed, first install it.");
        return false;
    }
    else
    {
        window.web3 = new Web3(window.ethereum);
    }



    /*
     * Secondly, check user connection, is it connected?
     */
    isUserConnected();



    /*
     * Check it, is user wallet connected?
     */
    async function isUserConnected()
    {
        const accounts = await web3.eth.getAccounts();
        console.log('###LOG: in user connected function..');

        // If account is connected
        if(accounts && accounts.length > 0)
        {
            const isDisconnected = window.localStorage.getItem("userDissConnectedWallet");
            console.log('###LOG: Disconnect request was sent (local storage) for: '+isDisconnected);

            // If user did not disconnect, get balance and set vars.
            if(isDisconnected == null)
            {
                // Set wallet variable value
                window.userWalletAddress = accounts[0];
                await setVars(accounts[0]);

                // Get balance of wallet, and set it
                const walletBalance = await getBalanceOfWallet(accounts[0]);
                window.walletBalance = walletBalance;

                if(walletBalance)
                    await showWalletAddress();
                else
                    return alert('Balance of wallet could not get.');
            }
            else
            {
                showWalletAddress();
            }
        }
        else
        {
            window.isConnected = false;
            showWalletAddress();
            alert("User is NOT connected to MetaMask.");
        }
    }





    /*
     * Connect to MetaMask and get account
     */
    async function connectAndGetAccount()
    {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if(accounts[0])
        {
            // Remove disconnect variable from local storage:
            window.localStorage.removeItem("userDissConnectedWallet");

            window.userWalletAddress = accounts[0];
            console.log('Account: '+accounts[0]);

            // Get balance of wallet
            const walletBalance  = await getBalanceOfWallet(accounts[0]);
            window.walletBalance = walletBalance;
            showWalletAddress(accounts[0], walletBalance);
        }
        else
        {
            alert('Account could not get.');
            return false;
        }

    }



    /*
     * Set variables if user is connected
     */
    async function setVars(address)
    {
        // Set local variable to check conn./disconnect option
        window.isConnected = true;
        console.log("#LOGG: The wallet is connected to MetaMask..");

        ethereum.on("chainChanged", () => window.location.reload());
        ethereum.on("message", (message) => console.log(message));

        ethereum.on("connect", (info) => {
            console.log(`Connected to network ${info}`);
        });

        ethereum.on("disconnect", (error) => {
            console.log(`Disconnected from network ${error}`);
        });

    }


    // Get balance of wallet
    async function getBalanceOfWallet(address)
    {
        if(address)
        {
            const balance = await web3.eth.getBalance(address);
            console.log('###LOGG: Balance of wallet: '+balance);
            return balance;
        }
        else { return false; }
    }




    // Display user wallet address and show/don't show disconnect button
    async function showWalletAddress(wallet = null, balance = null)
    {
        console.log('###LOG: in show wallet function..');

        // If wallet or balance or connection is not ture:
        if (!window.userWalletAddress || !window.walletBalance || !window.isConnected)
        {
            console.log('###LOG: No wallet or no balance so, show connect button');
            $('#DvAddressInfo').text('You are not connected to MetaMask yet.');

            btnConnect.show();
            btnDisconnect.hide();

            return false;
        }
        else
        {
            console.log('###LOG: Yes wallet & balance so, show disconnect button');

            const ethBalance 		= window.web3.utils.fromWei(window.walletBalance, 'ether');
            const friendlyBalance 	= parseFloat(ethBalance).toFixed(5);
            $('#DvAddressInfo').html('ETH Address: <br />' + window.userWalletAddress   +
                '<br /> <p>Balance Wei: '+ window.walletBalance +
                '<br />Balance ETH: ' + friendlyBalance+'</p>');

            // Show Disconnect button and hide connect button
            $(btnDisconnect).show();
            $(btnConnect).hide();
        }
    }




    // Delete user wallet address from browser local storage
    async function disconnectWallet()
    {
        console.log('###LOG: Disconnect wallet for: '+window.userWalletAddress)

        // Set a var to understand disconnect account (we check it above):
        window.localStorage.setItem("userDissConnectedWallet", window.userWalletAddress);

        window.userWalletAddress = null;
        window.walletBalance= null;
        showWalletAddress();
    }




    /*
     * Catch the account changing..
     */
    window.ethereum.on('accountsChanged', async () =>
    {
        console.log('#LOGG: Sth was changed on wallet side..');
        isUserConnected();
        showWalletAddress();
        window.location.reload();
    });



    /*
     * Catch the account disconnecting..
     */
    window.ethereum.on('disconnect', async () =>
    {
        console.log('###LOG: wallet is disconnetted..');
    });



    // Cacth the chain changing..
    window.ethereum.on('chainChanged', (chainId) =>
    {
        // Handle the new chain.
        // We recommend reloading the page unless you have good reason not to.
        window.location.reload();
    });



    // After connect button is clicked.
    btnConnect.click(function()
    {
        connectAndGetAccount();
    });

    // After disconnect button is clicked.
    btnDisconnect.click(function()
    {
        disconnectWallet();
    });



});

