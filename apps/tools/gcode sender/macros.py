MACROS = {
"lava_hotwheels": [
        {"type": "gcode", "data": "G91"},
        {"type": "sync", "data": "SET ON", "value": 2, "payload":"1"},
        {"type": "gcode", "data": "G1 X-50 F1000"},
        {"type": "gcode", "data": "G1 Y50"},
        {"type": "gcode", "data": "G1 X50"},
        {"type": "gcode", "data": "G1 Y50"},
        {"type": "gcode", "data": "G1 X-50"},
        {"type": "gcode", "data": "G1 Y50"},
        {"type": "gcode", "data": "G1 X50"},
        {"type": "sync", "data": "SET OFF", "value": 2, "payload":"0"},
        {"type": "gcode", "data": "G0 X-25 Y-75"},
        {"type": "sync", "data": "SET ON", "value": 1, "payload":"255"},
        {"type": "sync", "data": "DELAY", "value": 15000},
        {"type": "sync", "data": "SET OFF", "value": 1, "payload":"0"},
        {"type": "gcode", "data": "G90"}
    ],
}