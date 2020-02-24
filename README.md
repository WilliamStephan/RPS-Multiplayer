# RPS Nation

javaScript homework for full stack development bootcamp UT-Austin (UT-VIRT-FSF-PT-11-2019-U-LOL)

Another relatively simple project morphing into something a bit more complicated. What started as a two person rock, paper scissor game became a MMO game using Google's Firebase products. Here's an outline…

it is deployed here using [Google hosting](https://bootcamp-6ad6e.firebaseapp.com).

## Specifications

* Two users can play at the same time.
* Both players pick either `rock`, `paper` or `scissors`. 
* After the players make their selection, the game will tell them whether a tie occurred or if one player defeated the other.
* The game will track each player's wins and losses.
* Throw some chat functionality in there! No online multiplayer game is complete without having to endure endless taunts and insults from your jerk opponent.

## Items of note

* Up to 100 players at a time (limited by Google's free account).
* Full Firebase email authentication implemented for login credentials.
* Win, loss or tie notification via score and local chat notification – bot chat and bot scores are not transmitted via minimizing database traffic.
* Score history is stored in, and retrieved from user profile documents.
* User’s IP address is logged, and location data is stored in user profile documents. 
* Mass chat functionality for all online users.
* Distributed background processes emulate backend server functionality (FireStore implemented in frontend only).
* Background processes are scaleable based on user demand.
* Full responsive design, runs on mobile devices.
* Matrix scoring and results single line algorithm – no if or else statements required. 
