import requests
import time

ServUApi = "https://servu.ml/api";

user = {
	"username" : "tacos",
	"password" : "azerty"
};

token = "";
header = { "x-access-token" : token};

r = requests.post(ServUApi + "/login", json=user);

if r.status_code != 200:
	print("error get token");
	print(r.json());
else :
	token = r.json()['token']
	header = { "x-access-token" : token};
	
r = requests.get(ServUApi + "/users/" + user['username'] + "/devices", headers=header);

uuid = r.json()[0]['uuid'];

r = requests.get(ServUApi + "/users/" + user['username'] + "/devices/" + uuid + "/probes", headers=header);
probes = r.json();


wifi = {};
for probe in probes:
	if probe['name'] == 'wifi':
		wifi = probe;


action = {
	"type" : "flashlight",
	"label" : "My super label",
	"description" : "Beep Beep I'm a sheep",
	"parameters" : {
		"state" : "toggle"
	}
};
if wifi['active']:
	for i in range(1,7):
		print(i)
		r = requests.post(ServUApi + "/users/" + user['username'] + "/devices/" + uuid + "/ActionsUser", headers=header, json=action );
		if r.status_code != 201:
			print("error");
			print(r.json());
		else:
			print("Send success !")
		
		time.sleep(0.5);

