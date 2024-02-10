import socket
import ipaddress
from tabulate import tabulate
import re
from common_ports import ports_and_services

def check_input(input_str):
    try:
        # Attempt to create an IPv4 or IPv6 object
        ip_obj = ipaddress.ip_address(input_str)
        return ip_obj.version
    except ValueError:
        # If ValueError is raised, it's not a valid IP address
        try:
            # Attempt to create an IPv4 or IPv6 network object
            network_obj = ipaddress.ip_network(input_str, strict=False)
            return network_obj.version
        except ValueError:
            # If ValueError is raised again, it's not a valid network
            return False
        
def get_domain_from_ip(ip_address):
    try:
        domain_name, _, _ = socket.gethostbyaddr(ip_address)
        return domain_name
    except socket.herror:
        return None

# works locally but on replit you have to use the file common_ports.py  
# def get_protocol_name(port, protocol="tcp"):
#     try:
#         service_name = socket.getservbyport(port, protocol)
#         return service_name
#     except (socket.error, socket.herror, socket.gaierror, socket.timeout):
#         return "Unknown"


def get_open_ports(target, port_range, verbose=False):
    open_ports = []
    port = port_range[0]
   
    ip_regex = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
    if ip_regex.search(target):
        try:
            ip = ipaddress.ip_address(target)
            print("ip valid", ip)
        except:
            return "Error: Invalid IP address"
    else:
        try:
            hostName = socket.gethostbyname(target)
            print("valid hostname", hostName)
        except:
            return "Error: Invalid hostname"
        
    domain = get_domain_from_ip(target)


    while port <= port_range[1]:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.4)
        try:
            result = sock.connect_ex((domain or target, port))
            if  result == 0:
                print("port:", port, "open")
                open_ports.append(port)
            else:
                print("port:", port, "close")
        except socket.timeout:
            print("close")
        finally:
            port = port + 1
            sock.close()


    if (verbose == False):
        return(open_ports)
    elif (verbose == True):
        data = [("PORT", "", "", "SERVICE")]
        if (check_input(target)):
            if domain == None:
                returnStr = f"Open ports for {target}\n"
            else:
                returnStr = f"Open ports for {domain} ({target})\n"
        else:
            returnStr = f"Open ports for {target} ({hostName})\n"
        for port in open_ports:
            service_name = ports_and_services[port]
            data.append((port, "", "", service_name))
            
        returnStr += f"{tabulate(data, tablefmt='plain')}"
        print(returnStr)
        return(returnStr)
    