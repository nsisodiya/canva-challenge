Thanks for the assignment,
I have done assignment from my side. I have done my best in limited timeline. 
There is a possibility of misunderstanding, 
If I missed anything or not as per your desired result, Please let me know, I can modify.
 
 
Problems Faced
* Webpack was not allowed to use
=> Because webpack was not allowed to use, I used MY own small utility called define.js. This define.js
I wrote long back. So I just reused my own code.

* Query-String package.
=> I am not allowed to use webpack, So I cannot use package like https://github.com/sindresorhus/query-string or bluebird or similar.
   
I have used this kind of syntax `/team?tournamentId=${this.tournamentId}&teamId=${teamId}` which is kind of hack.

* Removal of Event Listener.
=> I have not used removal of eventListener, because in this particular example it is no use. 


Solution Used

* Promise Utilities
=> I have used my own promise Utility in this code. 
parallelExec.js & sequentialExec.js
Array.forEach is a utility which execute callback on each node in sync manner.
parallelExec and sequentialExec, execute callback on each node but in async manner.
https://gist.github.com/nsisodiya/a767d7ee09e99460c542298a83f25d26


If you face any problem in understanding my code, please revert me at 
narendra@narendrasisodiya.com