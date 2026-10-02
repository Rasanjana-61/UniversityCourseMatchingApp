# University-course-matching-app

University images are stored in `universities.logo_url` and
`universities.background_image_url` as optional image URLs. Backend startup adds
these columns to existing databases and fills missing campus banners for Jaffna,
Kelaniya, Peradeniya, Ruhuna, Sri Jayewardenepura, and Uva Wellassa. Existing
image URLs are preserved.

Set those columns on an existing university in PostgreSQL to use its official
logo and campus photo. For new universities, `POST /api/universities` accepts
`logoUrl` and `backgroundImageUrl` along with the required university fields.
Both university GET endpoints return `logo_url` and `background_image_url`.

The frontend displays the logo in Explore and the university details header,
and the background image as the details cover. Empty or failed URLs show the
university initials and the campus placeholder.

Changes to `logo_url` and `background_image_url` in Neon appear in Explore and
university details within 15 seconds while the app is active. Returning to the
app also refreshes these records. Use the refresh button in the details header
or pull down to fetch changes immediately.

Use direct image URLs that return image data (PNG, JPEG, WebP, etc.). Website
pages, Wikipedia articles, LinkedIn company pages, and Instagram reel links
cannot be displayed as images; use the actual image URL from those pages.

The six selected campus images and their original source pages are recorded in
`Backend/config/university-banners.js`. To apply those selections to an existing
database, run `npm run update-university-banners` from `Backend`. The command
checks every image URL and university record before updating the six banners
in one database transaction.
