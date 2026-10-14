menu = {
	1: ("Burger", 120.00),
	2: ("Pizza", 250.00),
	3: ("Pasta", 180.00),
	4: ("French fries", 80.00),
	5: ("Soft drink", 50.00),
}


def show_menu():
	print("\n--- Food Menu ---")
	for number, (name, price) in menu.items():
		print(f"{number}. {name} - Rs. {price:.2f}")
	print("0. Checkout")


def main():
	order = {}
	print("Welcome! Choose items from the menu.")

	while True:
		show_menu()
		try:
			choice = int(input("Enter an item number: "))
		except ValueError:
			print("Please enter a number from the menu.")
			continue

		if choice == 0:
			break
		if choice not in menu:
			print("That item number is not on the menu.")
			continue

		try:
			quantity = int(input("Enter quantity: "))
		except ValueError:
			print("Please enter a whole-number quantity.")
			continue

		if quantity <= 0:
			print("Quantity must be greater than zero.")
			continue

		order[choice] = order.get(choice, 0) + quantity
		print(f"Added {quantity} x {menu[choice][0]} to your order.")

	if not order:
		print("Your order is empty.")
		return

	print("\n--- Your Order ---")
	total = 0.0
	for number, quantity in order.items():
		name, price = menu[number]
		item_total = price * quantity
		total += item_total
		print(f"{name} x {quantity} - Rs. {item_total:.2f}")
	print(f"Total: Rs. {total:.2f}")
	print("Thank you for your order!")


if __name__ == "__main__":
	main()
