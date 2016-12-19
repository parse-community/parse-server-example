/***********************************************************************
* FILENAME :
*       main.js
*
* DESCRIPTION :
*       Main file containing all modules appNbite project. 
*
*
* NOTES :
*       These functions are a part of the appNbite suite;
*
*       Copyright appNbite 2014.  All rights reserved.
* 
* AUTHOR :
*       Americo Mazzotta        
*
* START DATE :
        18 Nov 2014
*
* CHANGES :
*
*       VERSION		DATE			WHO		DETAIL
*       0.0.1       		10Nov14     	AM      		First version of the APIs
*       0.0.2       		27Apr15     	AM      		Updated empty categories input / Added Filter per expiry date
*       0.0.3       		10May15   	AM      		Minor fixes. Removed old functions using callbacks
*       1.0.0       		05Jul15   	AM      		Major release. Implemented new algorithm for deals seach introducing new parse.com funcionalities
*
************************************************************************/
     
    // Import Jobs file
    require('cloud/jobs.js');
	// Import API file
    require('cloud/api.js');