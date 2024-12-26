export async function GET() {
   const jsonResponse = JSON.stringify({
        "message": "Hello World"
   });
   return new Response(jsonResponse, {
       headers: { 'Content-Type': 'application/json' }
   });
}