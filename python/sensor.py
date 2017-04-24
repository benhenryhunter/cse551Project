import json
import urllib2

data = {
        'python':"test"
}

req = urllib2.Request('http://localhost:8081/Sensor')
req.add_header('Content-Type', 'application/json')

response = urllib2.urlopen(req, json.dumps(data))

print(response)