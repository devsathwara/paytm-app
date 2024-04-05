import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { showTransaction } from "../../lib/actions/showTransaction";

export default async function TransactionPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    // Handle unauthenticated user
    return <div className="text-red-500">Unauthenticated</div>;
  }

  try {
    const transactionsData = await showTransaction(Number(userId));
    const transactions = transactionsData.transactions;

    if (!transactions || transactions.length === 0) {
      return <div className="container mx-auto p-4">No transactions found</div>;
    }

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Transaction History</h1>
        <ul>
          {transactions?.map((transaction:any) => (
            <li key={transaction.id} className="bg-gray-100 rounded-md p-4 mb-4">
              <div>
                <p className="font-semibold">Amount: {transaction.amount/100}</p>
                <p>Sender: {transaction.fromUser.name}</p>
                <p>Receiver: {transaction.toUser.name}</p>
                <p>Type: {getTransactionType(transaction, userId)}</p>
                <p>Time: {transaction.timestamp.toString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return <div className="container mx-auto p-4">Error fetching transactions</div>;
  }
}

function getTransactionType(transaction:any, userId:any) {
  if (transaction.fromUserId == Number(userId)) {
    return 'Debited';
  } else if (transaction.toUserId == Number(userId)) {
    return 'Credited';
  } else {
    return 'Unknown';
  }
}
