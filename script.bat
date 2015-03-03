ECHO Start of Loop

start cmd /c node ExpressTest.js 1350 1

FOR /L %%i IN (1351,1,1355) DO (
	timeout 1
  start cmd /c node ExpressTest.js %%i
  	
)