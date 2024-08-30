import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "react-hot-toast";

const useFollow = () => {

    const queryClient = useQueryClient();

    const { mutate:follow, isPending } = useMutation({
        mutationFn: async (userId) => {
            try {
                const response = await fetch(`/api/users/follow/${userId}`, {
                    method: "POST",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Something went wrong.");
                }

                return data;
            } catch (error) {
                console.log(error);
            }
        },
        onSuccess: () => {
            
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
                queryClient.invalidateQueries({ queryKey: ["authUser"] }),
            ])
            toast.success("Followed successfully");
        },
        onError: () => {
            toast.error("Something went wrong");
        },
    });

    return { follow, isPending };
};

export default useFollow;