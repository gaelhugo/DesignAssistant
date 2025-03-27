from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import urllib.parse

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes to allow requests from the web app

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the server is running."""
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route('/api/open-itunes', methods=['GET'])
def open_itunes():
    """Endpoint to open iTunes app on macOS."""
    try:
        # Use the 'open' command on macOS to launch iTunes/Music app
        subprocess.run(['open', '-a', 'Music'], check=True)
        return jsonify({
            "success": True,
            "message": "iTunes/Music app opened successfully"
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            "success": False,
            "message": f"Failed to open iTunes/Music app: {str(e)}"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"An unexpected error occurred: {str(e)}"
        }), 500

@app.route('/api/play-track', methods=['GET'])
def play_track():
    """Endpoint to play a specific track in iTunes/Music app."""
    track_name = request.args.get('track', '')
    
    if not track_name:
        return jsonify({
            "success": False,
            "message": "No track name provided. Use ?track=<track_name> in the URL."
        }), 400
    
    try:
        # First make sure iTunes/Music is open
        subprocess.run(['open', '-a', 'Music'], check=True)
        
        # Create an AppleScript to search for and play the track
        applescript = f'''
        tell application "Music"
            activate
            
            -- First try a more flexible search
            try
                -- Try to find by partial name match (case insensitive)
                set allTracks to (every track whose name contains "{track_name}" or name contains "{track_name.lower()}" or name contains "{track_name.upper()}")
                
                if length of allTracks is greater than 0 then
                    -- Found at least one matching track
                    set foundTrack to item 1 of allTracks
                    play foundTrack
                    return "Now playing: " & (get name of foundTrack) & " by " & (get artist of foundTrack)
                else
                    -- Try a more general search
                    set searchWords to my splitString("{track_name}", " ")
                    repeat with aWord in searchWords
                        if length of aWord > 3 then -- Only search for words longer than 3 chars
                            set matchingTracks to (every track whose name contains aWord)
                            if length of matchingTracks > 0 then
                                set foundTrack to item 1 of matchingTracks
                                play foundTrack
                                return "Found similar track: " & (get name of foundTrack) & " by " & (get artist of foundTrack)
                            end if
                        end if
                    end repeat
                    
                    -- If we get here, no tracks were found
                    -- List some available tracks for debugging
                    set availableTracks to (name of every track whose kind is song) as list
                    if length of availableTracks > 5 then
                        set availableTracks to items 1 thru 5 of availableTracks
                    end if
                    return "Track not found: '{track_name}'. Some available tracks: " & (availableTracks as string)
                end if
            on error errMsg
                return "Error searching for track: " & errMsg
            end try
        end tell
        
        -- Helper function to split string
        on splitString(theString, theDelimiter)
            set oldDelimiters to AppleScript's text item delimiters
            set AppleScript's text item delimiters to theDelimiter
            set theArray to every text item of theString
            set AppleScript's text item delimiters to oldDelimiters
            return theArray
        end splitString
        '''
        
        # Execute the AppleScript
        result = subprocess.run(['osascript', '-e', applescript], 
                               check=True, 
                               capture_output=True, 
                               text=True)
        
        response_message = result.stdout.strip()
        success = "Track not found" not in response_message and "Error searching for track" not in response_message
        
        return jsonify({
            "success": success,
            "message": response_message
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            "success": False,
            "message": f"Failed to play track: {str(e)}\nStderr: {e.stderr}"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"An unexpected error occurred: {str(e)}"
        }), 500

@app.route('/api/open-youtube', methods=['GET'])
def open_youtube():
    """Endpoint to open YouTube in Brave browser and play a specific video."""
    video_query = request.args.get('query', '')
    
    if not video_query:
        return jsonify({
            "success": False,
            "message": "No video query provided. Use ?query=<video_query> in the URL."
        }), 400
    
    try:
        # URL encode the query for safe inclusion in a URL
        encoded_query = urllib.parse.quote(video_query)
        youtube_url = f"https://www.youtube.com/results?search_query={encoded_query}"
        
        # Use the 'open' command on macOS to open the URL in Brave
        subprocess.run(['open', '-a', 'Brave Browser', youtube_url], check=True)
        
        return jsonify({
            "success": True,
            "message": f"Opened YouTube in Brave and searched for '{video_query}'"
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            "success": False,
            "message": f"Failed to open YouTube in Brave: {str(e)}"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"An unexpected error occurred: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Run the Flask app on port 5001
    app.run(host='0.0.0.0', port=5000, debug=True)