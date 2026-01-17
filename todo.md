
# Admin Panel Feature

- [x] Create database schema for threads and deleted items tracking
- [x] Create admin API routes for deleting threads and tweets
- [x] Add admin-only access control (owner only)
- [x] Add delete buttons (X) on threads and individual tweets
- [x] Implement save/persist functionality for deletions
- [x] Test admin functionality
- [x] Make all videos loop when played
- [x] Fix tweet numbering: show maroon circle inline with text, remove "1/", "2/" prefix from text

# Two-Page Layout Feature

- [x] Create new swipeable home page showing one random thread at a time
- [x] Add swipe left/right navigation on mobile
- [x] Add arrow key navigation on desktop
- [x] Randomize thread order on page load/refresh
- [x] Move current "all threads" view to secondary page (/browse)
- [x] Add navigation between the two pages
- [x] Add "Newest first" toggle button to switch between random and chronological order

# Admin Mode Improvements

- [x] Admin mode: Always show chronological order (no shuffle)
- [x] Fix database persistence for deletions
- [x] Add inline text editing for tweets in admin mode
- [x] Add media deletion capability for individual images/videos in admin mode

# User Features

- [x] Add favorites/bookmark feature for users

# Bug Fixes and UI Improvements

- [x] Fix database persistence - edits/deletions should persist permanently across reloads
- [x] Edit mode: chronological should be oldest first
- [x] User mode: chronological should be newest first
- [x] Replace Random/Newest buttons with a slider toggle
- [x] Header: consistent fixed height
- [x] Header: Space Grotesk font for "HFpEF Pearls"
- [x] Header: Northwestern purple color, no gradient

# Answer Field Feature

- [x] Add "answer" field to JSON schema (text and media)
- [x] Update TypeScript types for answer field
- [x] Remove expand/collapse functionality - show all tweets expanded
- [x] Add "Answer" button that reveals hidden answer content when clicked

# Font Update

- [x] Change title font from Space Grotesk to IBM Plex Sans

# Bug Fix - Edits Not Visible to Regular Users

- [x] Fix: edits/deletions made in admin mode should be visible to all users (not just authenticated)

# Card Header and Slider Updates

- [x] Simplify card header: remove post count, image count, figure count - keep only date
- [x] Make date span full width to prevent wrapping on mobile
- [x] Change slider to three options: Oldest / Random / Newest (default to Oldest)
- [x] Fix video display to show first frame instead of black thumbnail

# Video Playback Improvements

- [x] Make all videos loop continuously
- [x] Autoplay videos when card appears in viewport
- [x] Implement lazy loading for videos to reduce latency

- [x] Remove video controls - videos should just play continuously on repeat
