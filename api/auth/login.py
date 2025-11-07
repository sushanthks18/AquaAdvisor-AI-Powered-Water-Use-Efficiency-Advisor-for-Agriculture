# Vercel serverless function for authentication
def handler(event, context):
    # Return a simple response for now
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        'body': '{"message": "Auth endpoint"}'
    }