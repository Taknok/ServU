import requests

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
bluetooth = {};
network = {};
for probe in probes:
	if probe['name'] == 'wifi':
		wifi = probe;
	
	if probe['name'] == "bluetooth":
		bluetooth = probe;
	
	if probe['name'] == "network":
		network = probe;


action = {};
if wifi['active'] and bluetooth['active']:
	print("Network state : " + str(network['data']['state']));
	print("Bluetooth is enable: " + str(bluetooth['data']['isEnable']));
	if network['data']['state'] == "WiFi connection" and bluetooth['data']['isEnable']:
		print(">>> Flashlight !");
		action = {
			"type" : "flashlight",
			"label" : "My super label",
			"description" : "Beep Beep I'm a sheep",
			"parameters" : {
				"state" : "toggle"
			}
		};
	else : 
		print(">>> SMS !");
		action = {
			"type": "sms",
			"label": "My super label",
			"description": "Meow Meow I'm a cow",
			"parameters": {
				"dest" : "0689151855",
				"msg" : "Coucou from ServU !"
			}
		};
		
	r = requests.post(ServUApi + "/users/" + user['username'] + "/devices/" + uuid + "/ActionsUser", headers=header, json=action );
	if r.status_code != 201:
		print("error");
		print(r.json());
	else:
		print("Send success !")
	
else :
	print("Wifi activated : " + str(wifi['active']));
	print("Bluetooth activated : " + str(bluetooth['active']));

# print(r.json());